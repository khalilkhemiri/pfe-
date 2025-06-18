
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
        git credentialsId: 'github-token', url: 'https://github.com/khalilkhemiri/pfe-.git'
      }
    }

    stage('Backend Build') {
      steps {
        dir('jwt-demo-main') {
          echo "Building Spring Boot backend..."
          sh './mvnw clean install' // use `mvn` if you don’t have `mvnw`
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('QNB-front') {
          echo "Building Angular frontend..."
          sh 'npm install'
          sh 'ng build --configuration=production'
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        dir('jwt-demo-main') {
          withSonarQubeEnv('MySonarQubeServer') {
            sh './mvnw sonar:sonar -Dsonar.login=$SONAR_TOKEN'
          }
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
            def image = docker.build("${IMAGE_NAME}:${env.BUILD_NUMBER}")
            image.push()
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ All steps succeeded!'
    }
    failure {
      echo '❌ Pipeline failed.'
    }
  }
}
