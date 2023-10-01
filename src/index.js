import { initializeApp } from "firebase/app";
import { 
    getFirestore, collection, getDocs, doc, runTransaction
 } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBBIhSTYHOSWqGJO-peB_ujwo74H9L0Je4",
    authDomain: "wedding-f9e01.firebaseapp.com",
    projectId: "wedding-f9e01",
    storageBucket: "wedding-f9e01.appspot.com",
    messagingSenderId: "281501470356",
    appId: "1:281501470356:web:1811b82a2ec2bb4bcdee81"
};

// Inicializa la aplicación de Firebase
initializeApp(firebaseConfig);

// Inicializa los servicios de Firebase Firestore
const db = getFirestore();

// Referencia a la colección de regalos
const colRef = collection(db, 'Regalos');

// Array para almacenar los datos de los regalos
let regalos = [];

// Función para mostrar los datos de la colección de regalos
const mostrarRegalos = async () => {
    try {
        const querySnapshot = await getDocs(colRef);
        regalos = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            originalStock: doc.data().Stock
        }));

        const primeraColumna = document.getElementById('regalos-column-1');
        const segundaColumna = document.getElementById('regalos-column-2');
        const links = function links() {
            window.open("https://ww", "_blank");
            window.open("https://ww", "_blank");
        }
        
        regalos.forEach((regalo, index) => {
            const isChecked = regalo.Stock ? 'checked' : '';
            const disabledAttr = regalo.Stock ? 'disabled' : '';

            const checkboxHtml = `<input class="gift-check" type="checkbox" ${isChecked} ${disabledAttr} data-id="${regalo.id}" data-title="${regalo.title}">`;
            const regaloText = `<span class="regalo-text ${isChecked ? 'checked' : ''}">${regalo.title}</span>`;

            // Agregar un enlace (link) si el campo "Link" tiene contenido
            //const linkText1 = regalo.Link ? `<a href="${regalo.Link}" target="_blank">Ej. 1</a>` : '';
            //const linkText2 = regalo.Link2 ? `<a  href="${regalo.Link2}" target="_blank">Ej. 2</a>` : '';
            
            const linkText2 = `<a class="example-link" onclick="
                window.open('${regalo.Link}', '_blank')
                window.open('${regalo.Link2}', '_blank')
            "><u>Ver ejemplos</u></a>`;
            
            const regaloHtml = `<div class=""><p>${checkboxHtml} ${regaloText} &nbsp ${linkText2}</p></div>`;
            if (index < 11) {
                primeraColumna.innerHTML += regaloHtml;
            } else {
                segundaColumna.innerHTML += regaloHtml;
            }
        });

        // Agregar event listener para los checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => {
                const checkbox = event.target;
                const regaloId = checkbox.getAttribute('data-id');

                // Habilitar el botón de "Guardar cambios"
                guardarCambiosButton.disabled = false;
                guardarCambiosButton.setAttribute('data-id', regaloId);

                const regalo = regalos.find((regalo) => regalo.id === regaloId);
                if (regalo && regalo.Stock !== regalo.originalStock) {
                    checkbox.disabled = false;
                }
            });
        });
    } catch (error) {
        console.log(error.message);
    }
};

// Llama a la función para mostrar los regalos al cargar la página
mostrarRegalos();

// Obtiene una referencia al botón "Guardar cambios"
const guardarCambiosButton = document.getElementById("guardar-cambios");

// ...

// Agrega un event listener al botón "Guardar cambios"
guardarCambiosButton.addEventListener('click', async () => {
        // Mostrar el modal
    $('#loading').modal('show');
    const regaloId = guardarCambiosButton.getAttribute('data-id');
    if (regaloId) {
        const checkbox = document.querySelector(`input[data-id="${regaloId}"]`);
        if (checkbox) {
            try {
                 await runTransaction(db, async (transaction) => {
                    const regaloRef = doc(db, 'Regalos', regaloId);
                    const regaloSnapshot = await transaction.get(regaloRef);

                    if (!regaloSnapshot.exists()) {
                        throw new Error('El regalo no existe');
                    }

                    // Leer el valor actual de Stock
                    const stockActual = regaloSnapshot.data().Stock;

                    // Actualizar el valor de Stock en la base de datos
                    transaction.update(regaloRef, { Stock: checkbox.checked });

                    return stockActual;
                });

                $('#loading').modal('hide');
                console.log("Actualización exitosa");
                $('#myModalConfirmation').modal('show');

                // Deshabilitar el checkbox y el botón después de guardar los cambios
                checkbox.disabled = true;
                checkbox.removeAttribute('data-id');
                guardarCambiosButton.disabled = true;

                // Actualizar el valor original de Stock
                const regalo = regalos.find((regalo) => regalo.id === regaloId);
                if (regalo) {
                    regalo.originalStock = checkbox.checked;
                }

            } catch (error) {
                console.error('Error actualizando datos:', error);
            }
        }
    }
});

// Manjeador de evento para el botón "Aceptar" dentro del modal
document.getElementById("aceptarModal").addEventListener("click", function() {
    // Redirige al index.html
    window.location.href = "../index.html#gifts";
});