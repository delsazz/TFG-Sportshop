pipeline {
    agent any

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_COMPOSE = 'docker compose'
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY ?: 'docker.io'}"
        APP_NAME = 'sportshop'
    }

    stages {
        // === CHECKOUT ===
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${env.GIT_COMMIT}"
                }
            }
        }

        // === DEVELOP: Tests automáticos ===
        stage('Test - Develop') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '========== DEVELOP: Running automated tests =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.yml build
                        ${DOCKER_COMPOSE} -f docker-compose.yml run --rm backend ./mvnw clean test
                    '''
                }
            }
        }

        // === RELEASE: Tests completos + Despliegue preproducción ===
        stage('Test - Release') {
            when {
                branch 'release'
            }
            steps {
                script {
                    echo '========== RELEASE: Running complete test suite =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.yml build
                        ${DOCKER_COMPOSE} -f docker-compose.yml run --rm backend ./mvnw clean test
                    '''
                }
            }
        }

        stage('Build - Release') {
            when {
                branch 'release'
            }
            steps {
                script {
                    echo '========== RELEASE: Building release artifacts =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.prod.yml build --no-cache
                    '''
                }
            }
        }

        stage('Deploy - Preproducción') {
            when {
                branch 'release'
            }
            steps {
                script {
                    echo '========== RELEASE: Deploying to pre-production =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.server.yml up -d --build
                        sleep 10
                        # Health check
                        curl -f http://localhost/api/health || exit 1
                        echo "Pre-production deployment successful"
                    '''
                }
            }
        }

        // === MAIN: Aprobación manual + Despliegue producción ===
        stage('Approval - Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '========== MAIN: Waiting for approval =========='
                    input message: '¿Desplegar en producción?', ok: 'Deploy to Production'
                }
            }
        }

        stage('Build - Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '========== MAIN: Building production images =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.prod.yml build --no-cache
                    '''
                }
            }
        }

        stage('Deploy - Producción') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '========== MAIN: Deploying to production =========='
                    sh '''
                        set -e
                        ${DOCKER_COMPOSE} -f docker-compose.prod.yml up -d --build
                        sleep 15
                        # Health check
                        curl -f http://localhost/ || exit 1
                        echo "Production deployment successful"
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo '========== Cleanup =========='
                sh '''
                    # Clean up dangling images and containers
                    docker image prune -f --filter="dangling=true" || true
                    docker container prune -f || true
                '''
            }
        }

        success {
            script {
                echo '========== Pipeline Success =========='
                currentBuild.result = 'SUCCESS'
            }
        }

        failure {
            script {
                echo '========== Pipeline Failed =========='
                currentBuild.result = 'FAILURE'
            }
        }

        unstable {
            script {
                echo '========== Pipeline Unstable =========='
                currentBuild.result = 'UNSTABLE'
            }
        }

        cleanup {
            script {
                echo '========== Final Cleanup =========='
                cleanWs()
            }
        }
    }
}