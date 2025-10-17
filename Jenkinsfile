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
  
    stage('Frontend Build') {
      steps {
        dir('QNB-front') {
          echo "🛠️ Building Angular frontend..."
          sh 'npm install --force'
          sh 'npx ng build --configuration=production'
        }
      }
    }

    stage('Docker Build & Push Frontend') {
      steps {
        script {
          echo "🧱 Building and pushing frontend Docker image..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-token') {
            dir('QNB-front') {
              def image = docker.build("${IMAGE_NAME_FRONT}:${env.BUILD_NUMBER}", "--build-arg BUILD_DIR=dist/datta-able-free-angular-admin-template .")
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
