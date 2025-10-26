
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

docs_ref = db.collection('users').document('101576225637876028572').collection('files').document('article20241227205139')

doc = (docs_ref.get())


set_ref = db.collection('articles').document('article20241227205139')

set_ref.set(doc.to_dict())



