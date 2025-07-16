#!/bin/bash

CONTAINER_NAME="backend" 

BUCKET_NAME="chat-bucket"


LOG_DIR="/tmp/chat_logs"
mkdir -p $LOG_DIR

LOG_FILE="$LOG_DIR/backend_$(date +%Y-%m-%d_%H-%M-%S).log"

echo "Coletando logs do container '$CONTAINER_NAME'..."
docker logs $CONTAINER_NAME > "$LOG_FILE" 2>&1

if [ -s "$LOG_FILE" ]; then
    echo "Fazendo upload do arquivo '$LOG_FILE' para o bucket '$BUCKET_NAME'..."
    
    oci os object put --bucket-name "$BUCKET_NAME" --file "$LOG_FILE" --name "$(basename "$LOG_FILE")"

    if [ $? -eq 0 ]; then
        echo "Upload concluído com sucesso."
        echo "Removendo arquivo de log local: $LOG_FILE"
        rm "$LOG_FILE"
    else
        echo "ERRO: Falha no upload para a OCI. O arquivo de log foi mantido em '$LOG_FILE' para análise."
        exit 1
    fi
else
    echo "Nenhum log novo para fazer upload. Removendo arquivo vazio."
    rm "$LOG_FILE"
fi

echo "Script finalizado."


