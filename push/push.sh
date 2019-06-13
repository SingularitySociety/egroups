curl -X POST -H "Authorization: key=${SERVERKEY}" -H "Content-Type: application/json" -d "{
  \"to\": \"${CLIENTKEY}\",
  \"notification\": {
    \"title\": \"FCM Message\",
    \"body\": \"Hello Firebase Startup\",
    \"icon\": \"./img/icons/firebase-icon-192x192.png\"
  }
}" https://fcm.googleapis.com/fcm/send
