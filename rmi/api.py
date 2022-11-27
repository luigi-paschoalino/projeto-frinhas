import Pyro5.api
import psycopg2
import requests

def callAPI():
    retorno = requests.get()
    print(retorno)

emailer = Pyro5.api.Proxy('PYRONAME:emailer')
finished = False
emailList = []

while not finished:
    email = input('Digite um endereço de e-mail ou digite 0 para sair: ')
    if email == '0':
        finished = True
        assunto = input('Digite o assunto do e-mail: ')
        mensagem = input('Digite a mensagem do corpo do e-mail: ')
    else:
        emailList.append(email)

emailer.sendEmails(emailList, assunto, mensagem)