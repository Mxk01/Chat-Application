const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoscroll = () => {
  // Last message sent , last child of messages container


const $newMessage = $messages.lastElementChild;
// Height of the new message (doesn't take into account margin so we need to access the styles applied to this element and store margin into a variable)
const newMessageStyles = getComputedStyle($newMessage) // Return an object of all properties applied to an element
const newMessageMargin = parseInt(newMessageStyles.marginBottom);
const newMessageHeight = $newMessage.offsetHeight+newMessageMargin;// Calculating height of the element with the margin
const visibleHeight =    $messages.offsetHeight; // Visible eight of the  message container
const containerHeight =  $messages.scrollHeight;// All the available scrollable height (the height we cannot see)
// How far have I scrolled?
const scrollOffset = $messages.scrollTop+visibleHeight; // gives back the amount of distance scrolled from the top + the height of the whole message container
if(containerHeight-newMessageHeight<=scrollOffset){
  $messages.scrollTop = $messages.scrollHeight // Scrolling to the bottom

}
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room,users}) =>{
const html = Mustache.render(sidebarTemplate,{
  room,users
})
document.querySelector('#sidebar').innerHTML = html;
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
