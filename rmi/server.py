import Pyro5.server
import Pyro5.core
import yagmail

@Pyro5.server.expose
class Emailer(object):
    def sendEmails(self, emails, assunto, mensagem):
        gmail_user = 'defesacivil.unifei@gmail.com'
        gmail_password = 'kmqxhvodmjykvyjd'
        
        print('Enviando emails...')
        try:
            yag = yagmail.SMTP(gmail_user, gmail_password)
            to = emails
            subject = assunto
            body = mensagem
            
            yag.send(to, subject, body)
            
            print('Email enviado com sucesso!')
        except Exception as ex:
            print('Erro ao enviar email:', ex)
        return True

daemon = Pyro5.server.Daemon(host="10.244.251.240")
ns = Pyro5.core.locate_ns()
uri = daemon.register(Emailer)
ns.register("emailer", uri)
daemon.requestLoop()

