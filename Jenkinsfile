#!/usr/bin/env groovy

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        APP_NAME = 'quantum-application'
        CONTAINER_NAME = 'quantum-application'
        NODE_IMAGE = 'node:latest'
        APP_DIR = 'application'
        APP_PORT = '3000'
        HOST_PORT = '80'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm

                sh '''
                  set -eux
                  git rev-parse --short HEAD
                  git log -1 --oneline
                '''
            }
        }

        stage('Pull Node image') {
            steps {
                sh '''
                  set -eux
                  docker pull "$NODE_IMAGE"
                '''
            }
        }

        stage('Install dependencies and build') {
            steps {
                sh '''
                  set -eux

                  docker run --rm \
                    -v "$WORKSPACE:/app" \
                    -w "/app/$APP_DIR" \
                    "$NODE_IMAGE" \
                    sh -lc "npm ci && npm run build && test -f dist/index.html"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                  set -eux

                  docker rm -f "$CONTAINER_NAME" || true

                  docker run -d \
                    --name "$CONTAINER_NAME" \
                    --restart unless-stopped \
                    -p "$HOST_PORT:$APP_PORT" \
                    -v "$WORKSPACE:/app" \
                    -w "/app/$APP_DIR" \
                    "$NODE_IMAGE" \
                    sh -lc "npm install -g pm2 && pm2 start server.js --name $APP_NAME --no-daemon"

                  sleep 5

                  docker ps --filter "name=$CONTAINER_NAME"
                  docker logs "$CONTAINER_NAME" --tail 100

                  curl -sSf "http://127.0.0.1:$HOST_PORT" | head -n 20
                '''
            }
        }
    }

    post {
        success {
            echo 'Deploy done.'
        }

        failure {
            echo 'Pipeline failed. Container logs:'

            sh '''
              docker logs "$CONTAINER_NAME" --tail 200 || true
            '''
        }
    }
}