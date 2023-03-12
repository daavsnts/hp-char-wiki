'use strict'

const form = document.querySelector('#form')
const searchInput = document.querySelector('#search')
const errorElement = document.querySelector('#error')

const presentationElement = document.querySelector('#character-presentation')
const infoElement = document.querySelector('#character-info')
const houseInfoElement = document.querySelector('#character-house')

const getCharacterHouseHTML = ({ house }) => {
    const housesHTML = {
        '?': `<img src="./img/houses/no-house-logo.png">
        <p>No information given about the character house.</p>`,

        'Gryffindor': `<img src="./img/houses/gryffindor-logo.png">
        <p>Gryffindor was one of the four Houses of Hogwarts School of Witchcraft and Wizardry and was founded by Godric Gryffindor. 
        Gryffindor instructed the Sorting Hat to choose students possessing characteristics he most valued, 
        such as courage, chivalry, nerve and determination, to be sorted into his house. </br></br>
        The emblematic animal was a lion, and its colours were scarlet and gold. Sir Nicholas de Mimsy-Porpington, 
        also known as "Nearly Headless Nick", was the House ghost.</p>` ,

        'Slytherin': `<img src="./img/houses/slytherin-logo.png">
            <p>Slytherin was one of the four Houses at Hogwarts School of Witchcraft and Wizardry, founded by Salazar Slytherin. 
            In establishing the house, Salazar instructed the Sorting Hat to pick students who had a few particular characteristics he most valued. 
            Those characteristics included cunning, resourcefulness, leadership, and ambition. </br></br>
            The emblematic animal of the house was a snake and the house's colours were green and silver. </p>`,

        'Ravenclaw': `<img src="./img/houses/ravenclaw-logo.png">
            <p>Ravenclaw was one of the four Houses of Hogwarts School of Witchcraft and Wizardry. 
            Its founder was the medieval witch Rowena Ravenclaw. 
            Members of this house were characterised by their wit, learning, and wisdom. </br></br>
            The emblematic animal symbol was an eagle, and blue and bronze were its colours.</p>`,

        'Hufflepuff': `<img src="./img/houses/hufflepuff-logo.png">
            <p>Hufflepuff was one of the four Houses of Hogwarts School of Witchcraft and Wizardry.
            Its founder was the medieval witch Helga Hufflepuff. 
            Hufflepuff was the most inclusive among the four houses, valuing hard work, dedication, patience, loyalty, 
            and fair play rather than a particular aptitude in its members.</br></br>
            The emblematic animal was a badger, and yellow and black were its house colours. </p>`
    }

    return housesHTML[house]
}

const getCharacterInfoHTML = ({ species, dateOfBirth, gender, ancestry, wand: { wood, core }, patronus, house }) => {
    return `<ul>
                <li><b>Specie:</b> ${species}</li>
                <li><b>Date of birth:</b> ${dateOfBirth}</li>
                <li><b>Gender:</b> ${gender}</li>
                <li><b>Wand:</b> ${wood} | ${core}</li>
                <li><b>Ancestry:</b> ${ancestry}</li>
                <li><b>Patronus:</b> ${patronus}</li>
                <li><b>House:</b> ${house}</li>
            </ul>`
}

const getCharacterPresentationHTML = ({ name, image }) => {
    return `<h1 id="character-name" class="name">${name}</h1>
            <img id="character-image" src="${image}">`
}

const setErrorHTML = error => {
    error
        ?
        errorElement.innerHTML = `<div class="error-box"><h3 class="error tiny-text-shadow">* ${error}</h3></div>`
        :
        errorElement.innerHTML = ``
}

const setCharacterFromPage = character => {
    presentationElement.innerHTML = getCharacterPresentationHTML(character)
    infoElement.innerHTML = getCharacterInfoHTML(character)
    houseInfoElement.innerHTML = getCharacterHouseHTML(character)
}

const fillEmptyProps = characterCopy => {
    Object.keys(characterCopy).forEach(prop => {
        const propIsEmpty = (characterCopy[prop] === '')
        const imageProp = (prop == 'image')
        const nestedObject = (typeof characterCopy[prop] === 'object')
        const propNotNull = (characterCopy[prop] !== null)

        if (propIsEmpty) {
            if (imageProp) {
                characterCopy[prop] = `./img/characters/default-character-image.png`;
            } else {
                characterCopy[prop] = '?';
            }
        }

        if (nestedObject && propNotNull)
            fillEmptyProps(characterCopy[prop])
    })
}

const treatCharacter = character => {
    const characterCopy = JSON.parse(JSON.stringify(character))

    fillEmptyProps(characterCopy)
    addToLocalStorage(character.name, characterCopy)

    return characterCopy
}

const findCharacter = (characters, searchedName) => {
    const character = characters.find(character => character.name === searchedName)

    if (!character) throw `Character not found!`

    return treatCharacter(character)
}

const fetchCharacters = async () => {
    const url = `https://hp-api.onrender.com/api/characters`
    const response = await fetch(url)
    return await response.json()
}

const addToLocalStorage = (type, object) => localStorage.setItem(type, JSON.stringify(object))

const getFromLocalStorage = name => JSON.parse(localStorage.getItem(name))

const checkIfLocalStorageIsUpdated = (realTime) => {
    const LocalStorageUpdateDate = getFromLocalStorage('last-update-date')
    if (!LocalStorageUpdateDate) return false

    const { year: nowYear, month: nowMonth, day: nowDay, hours: nowHours, minutes: nowMinutes } = realTime
    const { year: storageYear, month: storageMonth, day: storageDay, hours: storageHours, minutes: storageMinutes } = LocalStorageUpdateDate

    const passedYear = (nowYear > storageYear)
    const sameYear = (nowYear == storageYear)
    const passedMonth = (nowMonth > storageMonth)
    const sameMonth = (nowMonth == storageMonth)
    const passedDay = (nowDay > storageDay)
    const sameDay = (nowDay == storageDay)
    const passedHour = (nowHours > storageHours)
    const sameHour = (nowHours == storageHours)
    const passedMinutes = (nowMinutes > storageMinutes)
    
    if (passedYear) return false 
    if (sameYear && passedMonth) return false
    if (sameMonth && passedDay) return false
    if (sameDay && passedHour) return false
    if (sameHour && passedMinutes) return false

    return true
}

const createDate = () => {
    const date = new Date()

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes()
    }
}

const getCharacter = async (searchedName) => {
    const charIsNotInLocalStorage = (!getFromLocalStorage(searchedName))
    const emptyLocalStorage = (!getFromLocalStorage('all-characters'))

    const todayDate = createDate()
    const storageUpdated = checkIfLocalStorageIsUpdated(todayDate) 

    if (charIsNotInLocalStorage || !storageUpdated) {
        if (emptyLocalStorage || !storageUpdated) {
            const allCharacters = await fetchCharacters()

            if (!allCharacters) throw `API Off-line!`

            addToLocalStorage('last-update-date', todayDate)
            addToLocalStorage('all-characters', allCharacters)
            return findCharacter(allCharacters, searchedName)
        }

        const allCharacters = getFromLocalStorage('all-characters')
        return findCharacter(allCharacters, searchedName)
    }

    return getFromLocalStorage(searchedName)
}

const handleFormSubmit = async (event) => {
    event.preventDefault()

    const searchedName = searchInput.value.trim()
    searchInput.value = ''
    searchInput.focus()

    if (!searchedName)
        throw `Please type a valid name!`

    setErrorHTML(``)

    return searchedName
}

const app = async (event) => {
    try {
        const searchedName = await handleFormSubmit(event)
        const character = await getCharacter(searchedName)
        setCharacterFromPage(character)
    } catch (error) {
        setErrorHTML(error)
    }
}

form.addEventListener('submit', app)