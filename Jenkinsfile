pipeline {
  agent any

  environment {
    SONAR_TOKEN = credentials('sonarqube-token')
    DOCKER_CREDENTIALS = credentials('dockerhub')
    IMAGE_NAME = "khalilkh/pfe-app"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', credentialsId: 'github-token', url: 'https://github.com/khalilkhemiri/pfe-.git'
      }
    }

    stage('Backend Build') {
      steps {
        dir('jwt-demo-main') {
          echo "🔧 Building Spring Boot backend..."
           sh 'chmod +x mvnw' // 🔧 Autoriser l'exécution
          sh './mvnw clean install' // or use 'mvn clean install' if mvnw doesn't exist
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('QNB-front') {
          echo "🛠️ Building Angular frontend..."
          sh 'npm install --force'
          sh 'npx ng build --configuration=production'
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        dir('jwt-demo-main') {
          withSonarQubeEnv('MySonarQubeServer') {
            echo "🔎 Running SonarQube analysis..."
            sh './mvnw sonar:sonar -Dsonar.login=$SONAR_TOKEN'
          }
        }
      }
    }

    stage('Docker Build & Push Backend') {
      steps {
        script {
          echo "🐳 Building and pushing backend Docker image..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
            dir('jwt-demo-main') {
              def backImage = docker.build("${IMAGE_NAME_BACK}:${env.BUILD_NUMBER}")
              backImage.push()
              backImage.push("latest")
            }
          }
        }
      }
    }

    stage('Docker Build & Push Frontend') {
      steps {
        script {
          echo "🌐 Building and pushing frontend Docker image..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
            dir('QNB-front') {
              def frontImage = docker.build("${IMAGE_NAME_FRONT}:${env.BUILD_NUMBER}")
              frontImage.push()
              frontImage.push("latest")
            }
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed. Check the logs.'
    }
  }
}
