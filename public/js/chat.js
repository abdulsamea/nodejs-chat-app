const socket = io()

//Elements
const $messageForm = document.querySelector('#submit-message-form')
const $messageFormInput = document.querySelector('.textMessage')
const $messageFormButton = document.querySelector('.sendMessage')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplateHTML = document.querySelector('#message-template').innerHTML
const $locationTemplateHTML = document.querySelector('#location-template').innerHTML
const $sidebarTemplateHTML = document.querySelector('#sidebar-template').innerHTML

const autoScroll = () => {
    // get new message  element
    const $newMessage = $messages.lastElementChild
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin)

    // Visible height of chat area
    const visibleHeight = $messages.offsetHeight
    // Height of message total container
    const containerHeight = $messages.scrollHeight

    // how far shd i automatically scroll?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    
} 


//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
//join chat room
socket.emit('join', { username, room }, (error) => {
    if(error){
    alert(error)
    location.href = '/'
    }
})


// Message listener
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplateHTML, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    // append to message template
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// location listener
socket.on('locationMessage', (locationLink) => {
    console.log(locationLink)
    const html = Mustache.render($locationTemplateHTML, {
        username: locationLink.username,
        locationLink: locationLink.text,
        createdAt: moment(locationLink.createdAt).format('h:mm a')
    })
    // append to message template
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// room data updation event 
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplateHTML, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    // let myMessage = document.querySelector('.textMessage').value
    let myMessage = e.target.elements.message.value
    //serverMEssage is callback received from server for acknowledgement msg from ' socket.on('sendMessage'....)'
    socket.emit('sendMessage', { myMessage, username }, (serverMessage) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log(`Acknowledgement from server :  ${serverMessage}`)
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        $locationButton.setAttribute('disabled', 'disabled')
        console.log(`${position.coords.latitude}, ${position.coords.longitude}`)
        
        let locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude 
        }

        socket.emit('sendLocation', locationData, (locationAck) => {
            $locationButton.removeAttribute('disabled')
            console.log(locationAck)
        })
    })
})
