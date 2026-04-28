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
            steps {
                sh '''
                  set -eux
                  docker run --rm \
                    -u "$(id -u):$(id -g)" \
                    -v "$WORKSPACE:/app" \
                    -w /app \
                    node:20 \
                    sh -lc "npm ci && npm run build && test -f dist/index.html"
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
                  curl -s http://127.0.0.1 | head -n 20
                '''
            }
        }
    }

    post {
        success {
            echo 'Deploy done.'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}