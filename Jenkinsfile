pipeline {
  agent any

  environment {
    SONAR_TOKEN = credentials('sonartoken')
    DOCKER_CREDENTIALS = credentials('dockerhub-token')
    IMAGE_NAME_BACK = "khalilkh/pfe-back"
    IMAGE_NAME_FRONT = "khalilkh/pfe-front"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/khalilkhemiri/pfe-.git'
      }
    }
  
    stage('Backend Build') {
      steps {
        dir('jwt-demo-main') {
          echo "🔧 Building Spring Boot backend..."
          sh 'chmod +x mvnw'
          sh './mvnw clean install'
        }
      }
    }

    stage('Docker Build & Push Backend') {
      steps {
        script {
          echo "🐳 Building and pushing backend Docker image..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-token') {
            dir('jwt-demo-main') {
              def image = docker.build("${IMAGE_NAME_BACK}:${env.BUILD_NUMBER}")
              image.push()
              image.push("latest")
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
