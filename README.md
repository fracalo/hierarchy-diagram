Hierarchy diagram js function
===

JS function for converting a js object that looks like :

    { name: 'granny',
      children: [
        { name: 'child' },
        { name: 'child2',
          children: [
            { name: 'g.child' },
            { name: 'g.child' },
            { name: 'g.child' }
          ]
        }
      ]
    }

into a command line style diagram encapsulated in an array:

    ["                -------------                               ",
     "                |  granny   |                               ",
     "                -------------                               ",
     "       _______________|_______________                      ",
     "       |                             |                      ",
     " -------------                 -------------                ",
     " |   child   |                 |  child2   |                ",
     " -------------                 -------------                ",
     "                      _______________|_______________       ",
     "                      |              |              |       ",
     "                -------------  -------------  ------------- ",
     "                |  g.child  |  |  g.child  |  |  g.child  | ",
     "                -------------  -------------  ------------- ",
     "                                                            "]


### description


#### `hierarchyDiag(object[, padding])`


 - Every object must have a `name` proprerty, and only one root object is supported
 - The `children` property is optional and must be an `array`
 - Written in ES6 (tested in latest chrome), for production pass it through a transpiller
 - Positioning is done through character count functions, and the result is always an array of equal length strings
 - An optional second argument is available to set total padding; default is 2 (this adds one space padding for side), any number passed in is coherced to a positive even number

 #### [example usage](http://codepen.io/maio/pen/grKakG)
