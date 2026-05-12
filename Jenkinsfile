pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker compose'
    }

    stages {
        // === DEVELOP: Tests automáticos ===
        stage('Test - Develop') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Ejecutando tests en rama develop...'
                sh '${DOCKER_COMPOSE} -f docker-compose.yml build'
                sh '${DOCKER_COMPOSE} -f docker-compose.yml run --rm backend ./mvnw test'
            }
        }

        // === RELEASE: Tests completos + Despliegue preproducción ===
        stage('Test - Release') {
            when {
                branch 'release'
            }
            steps {
                echo 'Ejecutando suite completa de tests en rama release...'
                sh '${DOCKER_COMPOSE} -f docker-compose.yml build'
                sh '${DOCKER_COMPOSE} -f docker-compose.yml run --rm backend ./mvnw test'
            }
        }

        stage('Deploy - Preproducción') {
            when {
                branch 'release'
            }
            steps {
                echo 'Desplegando en preproducción...'
                sh '${DOCKER_COMPOSE} -f docker-compose.prod.yml up -d --build'
            }
        }

        // === MAIN: Aprobación manual + Despliegue producción ===
        stage('Aprobación manual') {
            when {
                branch 'main'
            }
            steps {
                input message: '¿Desplegar en producción?', ok: 'Desplegar'
            }
        }

        stage('Deploy - Producción') {
            when {
                branch 'main'
            }
            steps {
                echo 'Desplegando en producción...'
                sh '${DOCKER_COMPOSE} -f docker-compose.prod.yml up -d --build'
            }
        }
    }

    post {
        failure {
            echo 'Pipeline fallido. Revisar los logs.'
        }
        success {
            echo 'Pipeline completado correctamente.'
        }
    }
}
