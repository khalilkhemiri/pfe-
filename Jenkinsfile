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
              def image = docker.build("${IMAGE_NAME_FRONT}:${env.BUILD_NUMBER}", "--build-arg BUILD_DIR=dist/datta-able-free-angular-admin-template .")
              image.push()
              image.push("latest")
            }
          }
        }
      }
    }

    stage('Kubernetes Deploy') {
      steps {
        script {
          echo "🚀 Deploying backend and frontend to Kubernetes..."

          def kubeConfig = 'export KUBECONFIG=~/k3s.yaml'

          // Apply manifests
          sh "${kubeConfig} && kubectl apply -f K8s/backend-deployment.yml"
          sh "${kubeConfig} && kubectl apply -f K8s/backend-service.yml"
          sh "${kubeConfig} && kubectl apply -f K8s/frontend-deployment.yml"
          sh "${kubeConfig} && kubectl apply -f K8s/frontend-service.yml"
          sh "${kubeConfig} && kubectl apply -f K8s/ingress.yaml"

          // 🔁 Forcer le restart pour appliquer la nouvelle image
          sh "${kubeConfig} && kubectl rollout restart deployment pfe-backend"
          sh "${kubeConfig} && kubectl rollout restart deployment pfe-frontend"

          // 🧪 Vérification (optionnel)
          sh "${kubeConfig} && kubectl get pods"
          sh "${kubeConfig} && kubectl get svc"
          sh "${kubeConfig} && kubectl get ingress"
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
