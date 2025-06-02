pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        SONAR_TOKEN = credentials('SONAR_TOKEN') 
        DOCKER_IMAGE = ' giftzyjenkins:latest'
    MONGO_URI           = credentials('MONGO_URI')
    JWT_SECRET          = credentials('JWT_SECRET')
    SESSION_SECRET      = credentials('SESSION_SECRET')
    GOOGLE_CLIENT_ID    = credentials('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET= credentials('GOOGLE_CLIENT_SECRET')
    }
    
    options {
  timeout(time: 30, unit: 'MINUTES') 
}


    stages {
        stage('Checkout') {
            steps {
                 git credentialsId: 'GITHUB_LOGIN', branch: 'main', url: 'https://github.com/nethmiweedeakin/giftzyJenkins.git'
            }
        }
        
        stage('Build') {
            steps {
                     // Kill any previously running Node.js processes
                  bat '''
taskkill /F /IM node.exe 2>NUL || echo No node process found
exit /b 0
'''
            bat '''
powershell -NoProfile -Command "$env:MONGO_URI='%MONGO_URI%'; $env:JWT_SECRET='%JWT_SECRET%'; $env:SESSION_SECRET='%SESSION_SECRET%'; $env:GOOGLE_CLIENT_ID='%GOOGLE_CLIENT_ID%'; $env:GOOGLE_CLIENT_SECRET='%GOOGLE_CLIENT_SECRET%'; Start-Process npm.cmd -ArgumentList 'run dev' -NoNewWindow; Start-Sleep -Seconds 10"
'''



        archiveArtifacts artifacts: '**/build/**', allowEmptyArchive: true
            }
        }


stage('Test') {
    steps {
        echo '🧪 Running tests...'
        // Run cucumber tests using the local cucumber-js binary
        bat 'npx @cucumber/cucumber --format json:reports/cucumber.json'
    }
}
stage('Generate and Publish Cucumber Report') {
    steps {
        echo '📋 Publishing Cucumber JSON report with Jenkins plugin...'

        // Publish the Cucumber report using the plugin
        cucumber buildStatus: 'UNSTABLE', fileIncludePattern: 'reports/cucumber.json'
    }
}




  stage('SonarCloud Code Quality') {
    steps {
        withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
            withSonarQubeEnv('MySonarCloud') {
                bat '''
                    echo Using SonarCloud token: %SONAR_TOKEN%
                    "C:\\Users\\Nethmi\\sonar-scanner\\bin\\sonar-scanner.bat" ^
                      -Dsonar.projectKey=nethmiweedeakin_giftzyJenkins ^
                      -Dsonar.organization=nethmiweedeakin ^
                      -Dsonar.host.url=https://sonarcloud.io ^
                      -Dsonar.login=%SONAR_TOKEN%
                '''
            }
        }
    }
}


    stage('Security') {
    steps {
        withCredentials([string(credentialsId: 'SNYK_SECRET_TOKEN', variable: 'SNYK_SECRET_TOKEN')]) {
            bat 'npm install -g snyk'
            bat 'snyk config set api=%SNYK_SECRET_TOKEN%'
            bat 'snyk test --file=package.json || exit 0'
        }
    }
}

stage('Cleanup Docker Port 3000') {
    steps {
        script {
            echo '🧼 Cleaning up containers using port 3000...'
bat '''
REM Stop containers using port 3000 if any exist
FOR /F "tokens=*" %%i IN ('docker ps -q --filter "publish=3000"') DO (
    docker stop %%i || echo Failed to stop container %%i
)

REM Remove containers using port 3000 if any exist
FOR /F "tokens=*" %%i IN ('docker ps -a -q --filter "publish=3000"') DO (
    docker rm %%i || echo Failed to remove container %%i
)

EXIT /B 0
'''



        }
    }
}


        stage('Deploy') {
    steps {
        script {
            try {
                echo '📦 Deploying application to Docker container...'

                // Kill any previously running Node.js processes
                bat 'taskkill /F /IM node.exe || echo No node process found'

                // Build the Docker image
                bat 'docker build --progress=plain -t %DOCKER_IMAGE% .'

                // Run the container with environment variables
                bat '''
                docker run -d -p 3000:3000 ^
                  -e "MONGO_URI=mongodb://host.docker.internal:27017/SIT725GroupProject" ^
                  -e JWT_SECRET=%JWT_SECRET% ^
                  -e SESSION_SECRET=%SESSION_SECRET% ^
                  -e GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID% ^
                  -e GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET% ^
                  %DOCKER_IMAGE%
                '''
            } catch (Exception e) {
                echo "🚨 Docker deploy failed: ${e.message}"
                currentBuild.result = 'FAILURE'
                error("❌ Stopping pipeline due to Docker error")
            }
        }
    }
}

        stage('Release') {
            steps {
                echo '🚀 Tagging release version...'
                script {
                  bat '''
@echo off
setlocal enabledelayedexpansion
FOR /F "delims=" %%i IN ('git describe --tags --always') DO (
  set GIT_TAG=%%i
)
git tag release-!GIT_TAG!
git push origin release-!GIT_TAG!
endlocal
'''

                }
            }
        }

      stage('Monitoring') {
    steps {
        echo '📈 Monitoring application health...'
        // Optional wait to let server start
      bat '''
ping 127.0.0.1 -n 6 >nul
'''


        // Perform health check
        bat 'curl http://localhost:3000/health || echo "⚠️ Health check failed!"'
    }
}
    
}
    post {
        always {
             echo '🛑 Killing server process...'
           bat '''
taskkill /F /IM node.exe 2>NUL || echo No node process found
exit /b 0
'''

            echo '🧹 Cleaning up...'
             echo 'Stopping and removing Docker container...'
            // Stop container if running
    bat '''
            FOR /F "tokens=*" %%i IN ('docker ps -q --filter "ancestor=giftzyjenkins:latest"') DO (
                docker stop %%i || echo Failed to stop container %%i
            )
            FOR /F "tokens=*" %%i IN ('docker ps -a -q --filter "ancestor=giftzyjenkins:latest"') DO (
                docker rm %%i || echo Failed to remove container %%i
            )
            exit 0
        '''

        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for details.'
        }
    }
}