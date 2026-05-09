#!/usr/bin/env groovy

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        APP_NAME = 'quantum-application'
        PORT = '3000'
        NODE_VERSION = '20'
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

        stage('Install dependencies') {
            steps {
                sh '''
                  set -eux

                  export NVM_DIR="$HOME/.nvm"
                  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                  nvm install "$NODE_VERSION"
                  nvm use "$NODE_VERSION"

                  node -v
                  npm -v

                  npm ci
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                  set -eux

                  export NVM_DIR="$HOME/.nvm"
                  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                  nvm use "$NODE_VERSION"

                  node -v
                  npm -v

                  npm run build
                  test -f dist/index.html
                '''
            }
        }

        stage('Install PM2') {
            steps {
                sh '''
                  set -eux

                  export NVM_DIR="$HOME/.nvm"
                  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                  nvm use "$NODE_VERSION"

                  if ! command -v pm2 >/dev/null 2>&1; then
                    npm install -g pm2
                  fi

                  pm2 -v
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                  set -eux

                  export NVM_DIR="$HOME/.nvm"
                  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                  nvm use "$NODE_VERSION"

                  pm2 delete "$APP_NAME" || true

                  PORT="$PORT" pm2 start server.js \
                    --name "$APP_NAME" \
                    --time

                  pm2 save

                  sleep 3

                  pm2 status
                  curl -sSf "http://127.0.0.1:$PORT" | head -n 20
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
            sh '''
              export NVM_DIR="$HOME/.nvm"
              [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

              nvm use "$NODE_VERSION" || true
              pm2 logs "$APP_NAME" --lines 100 --nostream || true
            '''
        }
    }
}