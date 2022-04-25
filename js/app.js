const form = document.querySelector('#form')
const searchInput = document.querySelector('#search')
const errorElement = document.querySelector('#error')

const presentationElement = document.querySelector('#character-presentation')
const infoElement = document.querySelector('#character-info')
const houseInfoElement = document.querySelector('#character-house')

const getCharacterHouseHTML = ({ house }) => {
    switch (house) {
        case '?':
            `<img src="./img/houses/no-house-logo.png">
            <p>No information given about the character house.</p>`
            break;
        case 'Gryffindor':
            `<img src="./img/houses/gryffindor-logo.png">
            <p>Gryffindor was one of the four Houses of Hogwarts School of Witchcraft and Wizardry and was founded by Godric Gryffindor. 
            Gryffindor instructed the Sorting Hat to choose students possessing characteristics he most valued, 
            such as courage, chivalry, nerve and determination, to be sorted into his house. </br></br>
            The emblematic animal was a lion, and its colours were scarlet and gold. Sir Nicholas de Mimsy-Porpington, 
            also known as "Nearly Headless Nick", was the House ghost.</p>`
            break;
        case 'Slytherin':
            `<img src="./img/houses/slytherin-logo.png">
            <p>Slytherin was one of the four Houses at Hogwarts School of Witchcraft and Wizardry, founded by Salazar Slytherin. 
            In establishing the house, Salazar instructed the Sorting Hat to pick students who had a few particular characteristics he most valued. 
            Those characteristics included cunning, resourcefulness, leadership, and ambition. </br></br>
            The emblematic animal of the house was a snake and the house's colours were green and silver. </p>`
            break;
        case 'Ravenclaw':
            `<img src="./img/houses/ravenclaw-logo.png">
            <p>Ravenclaw was one of the four Houses of Hogwarts School of Witchcraft and Wizardry. 
            Its founder was the medieval witch Rowena Ravenclaw. 
            Members of this house were characterised by their wit, learning, and wisdom. </br></br>
            The emblematic animal symbol was an eagle, and blue and bronze were its colours.</p>`
            break;
        case 'Hufflepuff':
            `<img src="./img/houses/hufflepuff-logo.png">
            <p>Hufflepuff was one of the four Houses of Hogwarts School of Witchcraft and Wizardry.
            Its founder was the medieval witch Helga Hufflepuff. 
            Hufflepuff was the most inclusive among the four houses, valuing hard work, dedication, patience, loyalty, 
            and fair play rather than a particular aptitude in its members.</br></br>
            The emblematic animal was a badger, and yellow and black were its house colours. </p>`
            break;
    }
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

const findCharacter = (characters, searchedName) => {
    const character = characters.find(character => character.name === searchedName)

    if (!character)
        throw `Character not found!`

    return character
}

const fetchCharacters = async () => {
        const url = `http://hp-api.herokuapp.com/api/characters`
        const response = await fetch(url)
        return await response.json()
}

const getCharacter = async (searchedName) => {
    const characters = await fetchCharacters()
    return findCharacter(characters, searchedName)
}

const fillEmptyProps = characterCopy => {
    Object.keys(characterCopy).forEach(prop => {
        const propIsEmpty = characterCopy[prop] === ''
        const imageProp = prop == 'image'
        const nestedObject = typeof characterCopy[prop] === 'object'
        const propNotNull = characterCopy[prop] !== null

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
    let characterCopy = JSON.parse(JSON.stringify(character))
    fillEmptyProps(characterCopy)

    return JSON.parse(JSON.stringify(characterCopy))
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
        const treatedCharacter = treatCharacter(character)
        setCharacterFromPage(treatedCharacter)
    } catch (error) {
        setErrorHTML(error)
    }
}

form.addEventListener('submit', app)