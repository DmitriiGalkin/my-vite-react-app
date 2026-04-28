#!/usr/bin/env groovy

pipeline {

    agent any

    stages {
        stage('Checkout') {
            steps {
                sh '''
                  git config --global --add safe.directory "$WORKSPACE" || true
                '''
                deleteDir()
                checkout scm
                sh 'git rev-parse --short HEAD'
                sh 'git log -1 --oneline'
            }
        }
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
                sh 'test -f dist/index.html'
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                  set -eux
                  docker rm -f my-site || true
                  docker run -d --name my-site \
                    -p 80:80 \
                    -v "$WORKSPACE/dist:/usr/share/nginx/html:ro" \
                    nginx:alpine
                  docker exec my-site ls -la /usr/share/nginx/html
                '''
            }
        }
    }
}