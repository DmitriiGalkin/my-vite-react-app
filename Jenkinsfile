#!/usr/bin/env groovy

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        CONTAINER_NAME = 'quantum-application'
        APPLICATION_NAME = 'application'
        BACKEND_NAME = 'backend'
        NODE_IMAGE = 'node:latest'
        APP_DIR = 'application'
        APP_PORT = '443'
        HOST_PORT = '443'
        BACKEND_DIR = 'backend'
    }

    stages {
        stage('Prepare workspace') {
            steps {
                sh '''
                  set +e

                  docker rm -f "$CONTAINER_NAME" || true

                  if [ -d "$WORKSPACE" ]; then
                    docker run --rm \
                      -v "$WORKSPACE:/workspace" \
                      "$NODE_IMAGE" \
                      sh -lc "chown -R $(id -u):$(id -g) /workspace || true"
                  fi
                '''

                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                                checkout scm

                                withCredentials([file(credentialsId: 'quantum-env-file', variable: 'ENV_FILE')]) {
                                    sh '''
                                      cp "$ENV_FILE" "$WORKSPACE/.env"
                                      chmod 600 "$WORKSPACE/.env"
                                    '''
                                }

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
                    --user "$(id -u):$(id -g)" \
                    --env-file "$WORKSPACE/.env" \
                    -e HOME=/tmp \
                    -e npm_config_cache=/tmp/.npm \
                    -v "$WORKSPACE:/workspace" \
                    -w /workspace \
                    "$NODE_IMAGE" \
                    sh -lc "cd application && npm ci && npm run build && test -f dist/index.html && cd ../backend && npm ci"
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
                      -p "4000:4000" \
                      --env-file "$WORKSPACE/.env" \
                      -e HOME=/tmp \
                      -e npm_config_cache=/tmp/.npm \
                      -e PM2_LOG_TRANSPORT=console \
                      -v "$WORKSPACE:/workspace" \
                      -v "/etc/ssl/quantum:/run/secrets/ssl:ro" \
                      -w /workspace \
                      "$NODE_IMAGE" \
                          sh -lc "npm install -g pm2 && pm2-runtime ecosystem.config.cjs"

                  sleep 5

                  docker ps --filter "name=$CONTAINER_NAME"

                  echo "Container logs:"
                  docker logs "$CONTAINER_NAME" --tail 100

                    echo "Healthcheck:"
                      if ! curl -sSf --resolve q3-dev.ru:443:127.0.0.1 "https://q3-dev.ru" | head -n 20; then
                        echo "Healthcheck failed. Container logs:"
                        docker logs "$CONTAINER_NAME" --tail 300 || true
                        exit 1
                      fi
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

        cleanup {
            sh '''
              set +e

              if [ -d "$WORKSPACE" ]; then
                docker run --rm \
                  -v "$WORKSPACE:/workspace" \
                  "$NODE_IMAGE" \
                  sh -lc "chown -R $(id -u):$(id -g) /workspace || true"
              fi
            '''
        }
    }
}