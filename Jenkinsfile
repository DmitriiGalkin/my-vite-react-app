#!/usr/bin/env groovy

pipeline {

    agent {
        docker {
            image 'node'
            args '-u root'
        }
    }

    stages {
        stage('Install') {
            steps {
                echo 'Install...'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploy static files to nginx container...'
                sh '''
                  docker rm -f my-site || true
                  docker run -d --name my-site -p 80:80 nginx:alpine
                  docker cp dist/. my-site:/usr/share/nginx/html
                '''
            }
        }
    }
}