import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

cred = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
app = firebase_admin.initialize_app(cred)

db = firestore.client()

yesterday = datetime.now() - timedelta(days=1)

last_refreshed_time = yesterday

users_ref = db.collection("users")

users = users_ref.stream()

for user in users:
    user_ref = users_ref.document(user.id)
    user_ref.update({
        'lastRefreshedTime': last_refreshed_time
    })

print("All users have been updated with the lastRefreshedTime field.")