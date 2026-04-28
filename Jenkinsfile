#!/usr/bin/env groovy

pipeline {

    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:20'
                    args '-u root'
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                  docker rm -f my-site || true
                  docker run -d --name my-site -p 80:80 nginx:alpine
                  docker cp dist/. my-site:/usr/share/nginx/html
                '''
            }
        }
    }
}