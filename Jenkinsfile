pipeline {
  agent any

  environment {
    SONAR_TOKEN = credentials('sonarqube-token')
    DOCKER_CREDENTIALS = credentials('dockerhub')
    IMAGE_NAME_BACK = "khalilkh/pfe-back"
    IMAGE_NAME_FRONT = "khalilkh/pfe-front"
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
          sh 'chmod +x mvnw'
          sh './mvnw clean install'
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
              def image = docker.build("${IMAGE_NAME_BACK}:${env.BUILD_NUMBER}")
              image.push()
              image.push("latest")
            }
          }
        }
      }
    }

    stage('Docker Build & Push Frontend') {
      steps {
        script {
          echo "🧱 Building and pushing frontend Docker image..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
            dir('QNB-front') {
              // Le dossier généré est dist/datta-able-free-angular-admin-template
              def image = docker.build("${IMAGE_NAME_FRONT}:${env.BUILD_NUMBER}", "--build-arg BUILD_DIR=dist/datta-able-free-angular-admin-template .")
              image.push()
              image.push("latest")
            }
          }
        }
      }
    }
    
    stage('Trivy Scan Docker Images') {
      steps {
        script {
          echo "🔍 Scanning Docker images with Trivy..."

          // Scanner l'image frontend
          sh "trivy image --severity CRITICAL,HIGH --format json --output trivy-report-frontend.json ${IMAGE_NAME_FRONT}:latest"

          // Scanner l'image backend
          sh "trivy image --severity CRITICAL,HIGH --format json --output trivy-report-backend.json ${IMAGE_NAME_BACK}:latest"

          // Afficher les rapports dans la console Jenkins
          sh 'cat trivy-report-frontend.json'
          sh 'cat trivy-report-backend.json'
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
