# LVM (http://www.drbd.org/) 

LVM Management.

## License

```
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 0.1, December 2013

 Copyright (C) 2013 LVM Interface <jchenavas@gmail.com>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
```

```
 This program is free software. It comes without any warranty, to
 the extent permitted by applicable law. You can redistribute it
 and/or modify it under the terms of the Do What The Fuck You Want
 To Public License, See http://www.wtfpl.net/ for more details.
```

## Description

Get LVM Datas

## Installation
```
npm install lvm
```

## Example
```js
var Lvm = require("lvm");
var lvm = new Lvm([true/false for showing logs]);

lvm.events.OnAfterOpen = function(cmd){	
	console.log("###################### " + cmd + " ###########################");
	console.log(JSON.stringify(lvm.nodes,null,4));
	console.log("######################################################################");
}

lvm.Open();
```