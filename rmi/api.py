import Pyro5.client
import Pyro5.core
import psycopg2 as pg
import time
import requests

#ns = Pyro5.core.locate_ns('10.244.251.240', 9090)
#uri = ns.lookup('emailer')
#emailer = Pyro5.client.Proxy(uri)
#finished = False
emailList = []

conn = pg.connect('dbname=unifei user=postgres password=postgres')
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) FROM noticia')
noticias = cursor.fetchone()[0]
print(noticias)

def noticiaEmail():    
    cursor.execute('SELECT email FROM usuario')
    emails = cursor.fetchall()
    for email in emails:
        emailList.append(email[0])
    print(emailList)

def consultaAPI():
    dadosAPI = requests.get('https://api.openweathermap.org/data/3.0/onecall?lat=-22.41&lon=-45.45&appid=a827e99f5e58683a9f553a6056926839')
    dadosAPI = dadosAPI.json()
    print(dadosAPI['alerts'][0]['sender_name'], dadosAPI['alerts'][0]['event'], dadosAPI['alerts'][0]['description'])

while True:
    time.sleep(5)
    consultaAPI()
    cursor.execute('SELECT COUNT(*) FROM noticia')
    count = cursor.fetchone()
    if count[0] > noticias:
        noticiaEmail()
        print('Nova notícia cadastrada. Enviando email...')
        cursor.execute('SELECT * from noticia ORDER BY idnoticia DESC LIMIT 1')
        noticia = cursor.fetchone()
        print(noticia)
        #emailer.sendEmail(emailList)
        noticias = count[0]
        print('Noticias: ' + str(noticias))
        print('Emails: ' + str(emailList))
    print(count[0])
#emailer.sendEmails(emailList, assunto, mensagem)