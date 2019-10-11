![Nexmo][logo]

# Enable Audio in an Existing Chat Application

Using Nexmo Client SDK, we're going to enable audio to be able to speak to other members of the conversation inside the browser.

[I don't want to read this whole thing, I just have a question!!!](#i-dont-want-to-read-this-whole-thing-i-just-have-a-question)

**Table of Contents**

- [Prerequisites](#prerequisites)
  - [Node & NPM](#node--npm)
  - [Nexmo CLI](#nexmo-cli)
  - [Git _(Optional)_](#git-optional)
- [The Demo Application](#the-demo-application)
  - [Basic Installation](#basic-installation)
- [Super Simple Setup](#super-simple-setup)
  - [What Did That Script Do?!?](#what-did-that-script-do)
- [Next Steps](#next-steps)
- [Enable Audio](#enable-audio)
- [I Don't Want To Run Your Script! (Running The CLI Steps Manually)](#i-dont-want-to-run-your-script-running-the-cli-steps-manually)
  - [Create Application](#create-application)
  - [Create Conversation](#create-conversation)
  - [Create the First User](#create-the-first-user)
  - [Create the Second User](#create-the-second-user)
  - [Update the Config File](#update-the-config-file)
- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

### Node & NPM

Developed with Node 8 and NPM 6. Check if they're installed and are up to date.

```bash
node --version
npm --version
```

If node or npm are not installed, [install them](https://nodejs.org/en/download/).

### Nexmo CLI

To setup our application, we’re going to need the Nexmo CLI installed. We’ll install it using npm. It's important to install the beta, as this 

```bash
npm install -g nexmo-cli@beta
```

[Sign up for a free Nexmo account](https://dashboard.nexmo.com/) and set up the Nexmo CLI with your API key and secret which you can find on the [settings page](https://dashboard.nexmo.com/settings).

```bash
nexmo setup <your_api_key> <your_api_secret>
```

### Git _(Optional)_

We’ll use git to clone our demo application from GitHub.

**If you’re not comfortable with git commands, don’t worry, we’ll cover downloading and unzipping it instead**.

[Follow this guide to install git, if necessary](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

## The Demo Application

### Basic Installation

```bash
git clone https://github.com/lukeoliff/nexmo-conversation.git
```

If you’re not comfortable with git commands or you’ve chosen not to install git, you can [download the demo application as a zip file](https://github.com/lukeoliff/nexmo-conversation/archive/master.zip) and unpack it locally.

Once cloned or unpacked, change into our new demo application directory.

```bash
cd nexmo-conversation
```

Install the npm dependencies.

```bash
npm install
```

Now, start the application.

```bash
npm start
```

The application should be running at the default address: [http://127.0.0.1:8080](http://127.0.0.1:8080).

You can log in with the default user “luke”, found in the [config.js](./config.js) file.

You’ll notice we’re just mocking authentication here.

## Super Simple Setup

This ships with a config script. Run that now to generate a new [config.js](./config.js) file with your settings. **If you don't want to run my script, [skip ahead to the manual setup section found at the end of the README](#i-dont-want-to-run-your-script-running-the-cli-steps-manually)**.

```bash
npm run setup-script
```

[config.js](./config.js) gets updated to look more like this:

```js
const USERS = {
  luke: 'eyJhbGciOiJIkpXVCJ9.eyJpYXQiOnt9fX19.EDHi1R61yh01oeZ9DYQ',
  mary: 'eyJhbGciOi234JXVCJ9.eyJpyXQiOjt9fX19.VqLdU97Fdb2ZiOfqmoQ',
}

const CONVERSATION_ID = 'CON-da9c1a6b-c2dc-4bdd-ac03-cc041ef03502'
```

### What Did That Script Do?!?

So, behind the scenes, the script carries out the following steps.

- Create a Nexmo application using the nexmo app:create command.
- Create a Nexmo conversation using the nexmo conversation:create command.
- Create both users using the nexmo user:create command.
- Add both users to the Nexmo conversation with nexmo member:add.
- Generate JWTs for both users to access the application.
- Writes out the config to config.js.

## Next Steps

Now, you can login as your two created users.

## Enable Audio

[Read my blog post on enabling audio in an existing chat application](https://www.nexmo.com/blog/2019/10/11/enable-audio-in-an-existing-chat-application-dr), or checkout/download `enable-audio` branch on this repository.

## I Don't Want To Run Your Script! (Running The CLI Steps Manually)

Here are the steps to create the configuration file manually using our Nexmo CLI.

### Create Application

Run the `app:create` CLI command. Returns an application ID.

```bash
nexmo app:create "Nexmo Demo Application" --capabilities=rtc --rtc-event-url=http://example.com --keyfile=private.key
```

Add the application ID returned from the command to a local environment variable.

```bash
# Application created: 32fwvc23f-6785j4th4-12ed2fg23

APPLICATION_ID=32fwvc23f-6785j4th4-12ed2fg23
```

### Create Conversation

Run the conversation:create CLI command. Creates a conversation for users to join. Returns a conversation ID.

```bash
nexmo conversation:create display_name="Nexmo Demo Conversation"
```

Add the conversation ID to your local environment variables.

```bash
# Conversation created: CON-123135-3463f3452-6443y6346

CONVERSATION_ID=CON-123135-3463f3452-6443y6346
```

### Create the First User

```bash
FIRST_USER_NAME=luke
```

Run the user:create CLI command. Creates a user to join the conversation. Returns a user ID.

```bash
nexmo user:create name=${FIRST_USER_NAME}
```

Add the returned user ID to your local environment variables.

```bash
# User created: USR-325vwef3-e325efwvw-3325ff234

FIRST_USER_ID=USR-325vwef3-e325efwvw-3325ff234
```

Add the first user to the conversation.

```bash
nexmo member:add ${CONVERSATION_ID} action=join channel='{"type":"app"}' user_id=${FIRST_USER_ID}
```

Generate the first users token for the config file.

```bash
FIRST_USER_JWT=${nexmo jwt:generate ./private.key sub=${FIRST_USER_NAME} exp=$(($(date +%s)+86400)) acl='{"paths":{"/v1/users/**":{},"/v1/conversations/**":{},"/v1/sessions/**":{},"/v1/devices/**":{},"/v1/image/**":{},"/v3/media/**":{},"/v1/applications/**":{},"/v1/push/**":{},"/v1/knocking/**":{}}}' application_id=${APPLICATION_ID}}
```

### Create the Second User

```bash
SECOND_USER_NAME=alex
```

Run the user:create CLI command. Creates a user to join the conversation. Returns a user ID.

```bash
nexmo user:create name=${SECOND_USER_NAME}
```

Add the returned user ID to your local environment variables.

```bash
# User created: USR-325vwef3-e325efwvw-3325ff234

SECOND_USER_ID=USR-325vwef3-e325efwvw-3325ff234
```

Add the first user to the conversation.

```bash
nexmo member:add ${CONVERSATION_ID} action=join channel='{"type":"app"}' user_id=${SECOND_USER_ID}
```

Generate the first users token for the config file.

```bash
SECOND_USER_JWT=${nexmo jwt:generate ./private.key sub=${SECOND_USER_NAME} exp=$(($(date +%s)+86400)) acl='{"paths":{"/v1/users/**":{},"/v1/conversations/**":{},"/v1/sessions/**":{},"/v1/devices/**":{},"/v1/image/**":{},"/v3/media/**":{},"/v1/applications/**":{},"/v1/push/**":{},"/v1/knocking/**":{}}}' application_id=${APPLICATION_ID}}
```

### Update the Config File

This will take the environment variables you created above, and output them to [config.js](./config.js)

```bash
echo "const USERS = {
  ${FIRST_USER_NAME}: '${FIRST_USER_JWT}',
  ${SECOND_USER_NAME}: '${SECOND_USER_JWT}',
}
const CONVERSATION_ID = '${CONVERSATION_ID}'" > config.js
```

## Code of Conduct

In the interest of fostering an open and welcoming environment, we strive to make participation in our project and our community a harassment-free experience for everyone. Please check out our [Code of Conduct][coc] in full.

## Contributing 
We :heart: contributions from everyone! Check out the [Contributing Guidelines][contributing] for more information.

[![contributions welcome][contribadge]][issues]

## License

This project is subject to the [MIT License][license]

[logo]: nexmo.png "Nexmo"
[contribadge]: https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat "Contributions Welcome"

[coc]: CODE_OF_CONDUCT.md "Code of Conduct"
[contributing]: CONTRIBUTING.md "Contributing"
[license]: LICENSE "MIT License"

[issues]: ./../../issues "Issues"

# I don't want to read this whole thing I just have a question!!!

You can join the Nexmo Community Slack for any questions you might have:

* [Contact our Developer Relations Team][community]
* [Reach out on Twitter][twitter]
    * This Twitter is monitored by our Developer Relations team, but not 24/7 &mdash; please be patient!
* [Join the Nexmo Community Slack][slack]
    * Even though Slack is a chat service, sometimes it takes several hours for community members to respond &mdash; please be patient!
    * Use the `#general` channel for general questions or discussion
    * Use the `#status` channel for receiving updates on our service status
    * There are many other channels available, check the channel list for channels for a specific library

Alternatively, you can raise an issue on this project.

[community]: https://developer.nexmo.com/community "Nexmo Community"
[slack]: https://developer.nexmo.com/community/slack "Nexmo Community Slack"
[twitter]: https://twitter.com/NexmoDev "NexmoDev on Twitter"
