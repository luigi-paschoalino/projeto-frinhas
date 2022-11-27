import Pyro5.api
import yagmail

@Pyro5.api.expose
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

daemon = Pyro5.api.Daemon()
print('Daemon rodando')
ns = Pyro5.api.locate_ns()
print('NS localizado')
uri = daemon.register(Emailer)
print('Registrando objeto')
ns.register('emailer', uri)
print('Objeto registrado')

print('Servidor de email rodando...')
daemon.requestLoop()
