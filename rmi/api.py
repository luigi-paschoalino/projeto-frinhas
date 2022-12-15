import Pyro5.client
import Pyro5.core
import psycopg2 as pg
import time
import requests

ns = Pyro5.core.locate_ns('10.244.251.240', 9090)
uri = ns.lookup('emailer')
emailer = Pyro5.client.Proxy(uri)
print('Conectou no Leo:', uri, '\nemailer:', emailer)

def consultaAPI():
    dadosAPI = requests.get('https://api.openweathermap.org/data/3.0/onecall?lat=-22.41&lon=-45.45&appid=a827e99f5e58683a9f553a6056926839')
    dadosAPI = dadosAPI.json()
    print(dadosAPI['daily'][0]['rain'], dadosAPI['daily'][0]['pop'])
    chuva = ''
    probabilidade = ''
    
    if dadosAPI['daily'][0]['rain']/24 > 8:
        chuva = 'Forte'
    elif dadosAPI['daily'][0]['rain']/24 > 4:
        chuva = 'Média'
    elif dadosAPI['daily'][0]['rain']/24 > 0.5:
        chuva = 'Fraca'
    else:
        chuva = 'Nenhuma'
    
    if dadosAPI['daily'][0]['pop'] > 0.8:
        probabilidade = 'Alta'
    elif dadosAPI['daily'][0]['pop'] > 0.5:
        probabilidade = 'Média'
    elif dadosAPI['daily'][0]['pop'] > 0.2:
        probabilidade = 'Baixa'
    else:
        probabilidade = 'Baixíssima'

    emailer.sendEmails(noticiaEmail(), 'Previsão do tempo', 'Previsão do tempo para hoje: probabilidade {} de chuva de intensidade {}\n\nProbabilidade: {}%\nVolume de precipitação: {:.2f} mm/h'.format(probabilidade.lower(), chuva.lower(), dadosAPI['daily'][0]['pop']*100, dadosAPI['daily'][0]['rain']/24))

    
firstTime = True

while True: # Verificação de novas notícias registradas no banco de dados,consulta da API e envio de email
    if firstTime is False:
        time.sleep(60)
    consultaAPI()
    firstTime = False