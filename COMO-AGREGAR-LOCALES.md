# Cómo agregar un comercio a la página principal

La portada muestra una ficha por cada comercio. Cada ficha lleva a la página individual del local.

## 1. Crear la página individual

Guardá la página del nuevo comercio en una carpeta dentro de `outputs`. Por ejemplo:

```text
outputs/
├── Main Page/
│   ├── index.html
│   ├── main.js
│   └── restaurants-data.js
└── casa-de-comidas/
    └── index.html
```

Podés partir de una copia de la página de Baig Burguers y cambiar su nombre, productos, fotos, colores y datos de contacto. Conservá los archivos de cada local juntos en su propia carpeta.

## 2. Preparar una foto

Poné una foto representativa en la carpeta del nuevo comercio, por ejemplo `outputs/casa-de-comidas/local.jpg`. Usá una imagen horizontal y liviana para que la portada cargue rápido.

## 3. Agregar el comercio a la lista

Abrí `restaurants-data.js` y agregá un objeto más dentro de `window.RESTAURANTS`. Separá cada objeto con una coma. Ejemplo:

```js
{
  name: 'Casa de Comidas',
  category: 'Pizza',
  description: 'Pizzas al horno y empanadas caseras.',
  image: '../casa-de-comidas/local.jpg',
  imageAlt: 'Pizza recién horneada de Casa de Comidas',
  page: '../casa-de-comidas/index.html',
  rating: '4.8',
  deliveryTime: '25–40 min',
  location: 'San Justo',
  status: 'Abierto',
  searchTerms: 'pizza empanadas horno'
}
```

Las rutas `image` y `page` se escriben desde `outputs/Main Page/index.html`. Por eso, para entrar a `outputs/casa-de-comidas/index.html`, se usa `../casa-de-comidas/index.html`.

## 4. Guardar y revisar

Guardá `restaurants-data.js` y volvé a cargar `Main Page/index.html`. El nuevo comercio aparece como tarjeta, su categoría se agrega al filtro automáticamente y al tocar **Ver menú** se abre su página individual.

La portada de hoy muestra solo Baig Burguers. Los demás comercios aparecerán cuando agregues sus páginas y sus objetos a la lista.
