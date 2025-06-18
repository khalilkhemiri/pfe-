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
          sh './mvnw clean install' // or use 'mvn clean install' if mvnw doesn't exist
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('QNB-front') {
          echo "🛠️ Building Angular frontend..."
          sh 'npm install'
          sh './node_modules/@angular/cli/bin/ng build --configuration=production'
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

    stage('Docker Build & Push') {
      steps {
        script {
          echo "🐳 Building Docker image and pushing to DockerHub..."
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
            def image = docker.build("${IMAGE_NAME}:${env.BUILD_NUMBER}")
            image.push()
            image.push("latest")
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
