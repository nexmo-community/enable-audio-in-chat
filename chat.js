class ChatApp {
  constructor() {
    this.messageTextarea = document.getElementById('messageTextarea')
    this.sendButton = document.getElementById('send')
    this.loginForm = document.getElementById('login')
    this.loginButton = document.getElementById('loginButton')
    this.messages = document.getElementById('messages')
    this.messageFeed = document.getElementById('messageFeed')
    this.audio = document.getElementById('audio')
    this.audioToggle = document.getElementById('audioToggle')
    this.audioToggleText = document.getElementById('audioToggleText')
    this.setupUserEvents()
  }

  joinConversation(userToken) {
    new NexmoClient({ debug: false })
      .login(userToken)
      .then(app => {
        console.log('*** Logged into app', app)
        return app.getConversation(CONVERSATION_ID)
      })
      .then((conversation) => {
        console.log('*** Joined conversation', conversation)
        this.setupConversationEvents(conversation)
      })
      .catch(this.errorLogger)
  }

  showConversationHistory(conversation) {
    conversation
      .getEvents({ page_size: 20 })
      .then((events_page) => {
        var eventsHistory = ""

        events_page.items.forEach((value, key) => {
          if (conversation.members.get(value.from)) {
            const date = new Date(Date.parse(value.timestamp))
            switch (value.type) {
              case 'text':
                eventsHistory = `${conversation.members.get(value.from).user.name} @ ${date.toLocaleString('en-GB')}: <b>${value.body.text}</b><br>` + eventsHistory
                break;
              case 'member:joined':
                eventsHistory = `${conversation.members.get(value.from).user.name} @ ${date.toLocaleString('en-GB')}: <b>joined the conversation</b><br>` + eventsHistory
                break;
            }
          }
        })

        this.messageFeed.innerHTML = eventsHistory + this.messageFeed.innerHTML
      })
      .catch(this.errorLogger)
  }

  setupConversationEvents(conversation) {
    this.conversation = conversation
    this.messages.style.display = "block"

    // Bind to events on the conversation
    conversation.on('text', (sender, message) => {
      const date = new Date(Date.parse(message.timestamp))
      console.log('*** Message received', sender, message)
      const text = `${sender.user.name} @ ${date.toLocaleString('en-GB')}: <b>${message.body.text}</b><br>`
      this.messageFeed.innerHTML = text + this.messageFeed.innerHTML
    })

    conversation.on("member:joined", (member, event) => {
      const date = new Date(Date.parse(event.timestamp))
      console.log(`*** ${member.user.name} joined the conversation`)
      const text = `${member.user.name} @ ${date.toLocaleString('en-GB')}: <b>joined the conversation</b><br>`
      this.messageFeed.innerHTML = text + this.messageFeed.innerHTML
    })

    conversation.on("member:media", (member, event) => {
      console.log(`*** Member changed media state`, member, event)
      const text = `${member.user.name} <b>${event.body.audio ? 'enabled' : 'disabled'} audio in the conversation</b><br>`
      this.messageFeed.innerHTML = text + this.messageFeed.innerHTML
    })

    this.showConversationHistory(conversation)
  }

  errorLogger(error) {
    console.log(error)
  }

  eventLogger(event) {
    return () => {
      console.log("'%s' event was sent", event)
    }
  }

  setupUserEvents() {
    this.sendButton.addEventListener('click', () => {
      this.conversation.sendText(this.messageTextarea.value)
        .then(() => {
            this.eventLogger('text')()
            this.messageTextarea.value = ''
        })
        .catch(this.errorLogger)
    })
  
    this.loginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const userName = this.loginForm.children.username.value
      const userToken = this.authenticate(userName)
      this.loginForm.children.username.value = ''
      if (userToken) {
        this.joinConversation(userToken)
        this.loginForm.style.display = 'none'
      } else {
        alert('user not found')
      }
    })

    this.audioToggle.addEventListener('click', () => {
      const buttonContainer = this.audioToggle.parentNode
      if (this.audioToggle.checked) {
        this.audioToggleText.innerHTML = 'Disable Audio'
        buttonContainer.classList.add('btn-danger')
        buttonContainer.classList.add('active')
        buttonContainer.classList.remove('btn-secondary')
        this.conversation.media.enable().then(stream => {
          // Older browsers may not have srcObject
          if ("srcObject" in this.audio) {
            this.audio.srcObject = stream
          } else {
            // Avoid using this in new browsers, as it is going away.
            this.audio.src = window.URL.createObjectURL(stream)
          }

          this.audio.onloadedmetadata = () => {
            this.audio.play()
          }

          this.eventLogger('member:media')()
        }).catch(this.errorLogger)
      } else {
        this.audioToggleText.innerHTML = 'Enable Audio'
        buttonContainer.classList.remove('btn-danger')
        buttonContainer.classList.remove('active')
        buttonContainer.classList.add('btn-secondary')
        this.conversation.media.disable().then(this.eventLogger('member:media')).catch(this.errorLogger)
      }
    })
  }

  authenticate(username) {
    return USERS[username] || null
  }
}
new ChatApp()