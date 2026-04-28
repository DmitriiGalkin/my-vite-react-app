#!/usr/bin/env groovy

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        SITE_CONTAINER = 'my-site'
    }

    stages {
        stage('Checkout') {
            steps {
                sh '''
                  set -eux
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
                sh '''
                  set -eux
                  npm ci
                  npm run build
                  test -f dist/index.html
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                  set -eux
                  docker rm -f "$SITE_CONTAINER" || true
                  docker run -d --name "$SITE_CONTAINER" \
                    -p 80:80 \
                    -v "$WORKSPACE/dist:/usr/share/nginx/html:ro" \
                    nginx:alpine

                  docker exec "$SITE_CONTAINER" ls -la /usr/share/nginx/html
                  curl -s http://127.0.0.1 | head -n 20
                '''
            }
        }
    }

    post {
        success {
            echo 'Deploy done. Site should be available on server IP (port 80).'
        }
        failure {
            echo 'Pipeline failed. Check stage logs above.'
        }
    }
}