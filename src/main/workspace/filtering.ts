/* eslint-disable vars-on-top */
/* eslint-disable no-var */
// eslint-disable-next-line max-classes-per-file
import * as fs from 'fs';

class AbstractFilter {
  // path: string | undefined;
  condition: string;

  value: string;

  ftype: string;

  constructor(condition: string, value: string) {
    this.condition = condition;
    this.value = value;
    this.ftype = 'NONE';
  }

  evaluate(path: string): boolean {
    return true;
  }
}
class NameFilter extends AbstractFilter {
  constructor(condition: string, value: string) {
    super(condition, value);
    this.ftype = 'NAME';
  }

  evaluate(path: string): boolean {
    // console.log(path.indexOf(this.value));
    // return !(this.value.indexOf(path) >= 0);
    if (this.condition === 'contains') {
      return !(path.indexOf(this.value) >= 0);
    }
    if (this.condition === 'fullmatch') return path === this.value;
    return true;
  }
}

class ExtensionFilter extends AbstractFilter {
  constructor(condition: string, value: string) {
    super(condition, value);
    this.ftype = 'EXTENSION';
  }

  evaluate(path: string): boolean {
    return !path.endsWith(this.value);
  }
}

class SizeFilter extends AbstractFilter {
  constructor(condition: string, value: string) {
    super(condition, value);
    this.ftype = 'SIZE';
  }

  evaluate(path: string): boolean {
    const file = fs.readFileSync(path, 'binary');

    if (this.condition === '>') {
      if (file.length > parseInt(this.value, 10)) {
        //   console.log("NO aceptado por que NO es mayor");
        return false;
      }
      return true;
    }
    if (this.condition === '<') {
      if (file.length < parseInt(this.value, 10)) {
        //  console.log("NO aceptado por que NO es menor");
        return false;
      }
      return true;
    }
    if (this.condition === '=') {
      if (file.length === parseInt(this.value, 10)) {
        //   console.log("NO aceptado por que  IGUAL");
        return false;
      }
      //  console.log("Aceptado por que es NO  IGUAL");
      return true;
    }

    return true;
  }
}
class DateFilter extends AbstractFilter {
  constructor(condition: string, value: string) {
    super(condition, value);
    this.ftype = 'DATE';
  }

  evaluate(path: string): boolean {
    const stats = fs.statSync(path);

    modified = stats.mtime;

    const lDate = new Date(this.value);

    const ms: number = stats.mtimeMs;
    var modified = new Date(ms);
    // console.log(lDate);
    // console.log(modified);
    if (this.condition === '>') {
      if (modified > lDate) {
        return false;
      }
      return true;
    }
    if (this.condition === '<') {
      if (modified < lDate) {
        return false;
      }
      return true;
    }
    return true;
  }
}

export class BannedList {
  name: string;

  filters: AbstractFilter[];

  constructor(name: string) {
    this.name = name;
    this.filters = [];
  }

  addFilter(filter: AbstractFilter): void {
    this.filters.push[this.filters.length] = filter;
  }

  evaluate(path: string): boolean {
    let i: number;
    for (i = 0; i < this.filters.length; i += 1) {
      if (!this.filters[i].evaluate(path)) return false;
    }
    return true;
  }

  save(path: string) {
    // path = '';
    fs.writeFileSync(path, JSON.stringify(this.filters).toString());
  }

  load(path: string) {
    // const file = fs.readFileSync("/home/oscar/filters.txt", "utf8");
    const file = fs.readFileSync(path, 'utf8');
    const a = JSON.parse(file);
    let i: number;
    for (i = 0; i < a.length; i += 1) {
      if (a[i].ftype === 'NAME')
        this.addFilter(new NameFilter(a[i].condition, a[i].value));
      if (a[i].ftype === 'DATE')
        this.addFilter(new DateFilter(a[i].condition, a[i].value));
      if (a[i].ftype === 'SIZE')
        this.addFilter(new SizeFilter(a[i].condition, a[i].value));
      if (a[i].ftype === 'EXTENSION')
        this.addFilter(new ExtensionFilter(a[i].condition, a[i].value));
    }
  }
}
// export class BannedList
module.exports = {
  DateFilter,
  BannedList,
  NameFilter,
  SizeFilter,
};
/* var n=new NameFilter("contains","readme")
// console.log(n.evaluate("readme.txt"))
var e=new ExtensionFilter("=","txto")
//console.log(e.evaluate("readme.txto"))
var s= new SizeFilter ("=","364");
//s.evaluate("/home/oscar/Beqs")
var f = new DateFilter("<", "2021-02-03T15:11:44.328Z");
//console.log(f.evaluate("/home/oscar/file.txt")); */
/* var list= new BannedList("Quique");
list.load("/home/oscar/filters.txt");
console.log(list.evaluate("/home/oscar/salida.txt") ) */
// list.addFilter(n)
// list.addFilter(e)
// list.addFilter(s)
// list.addFilter(f)
// console.log(list.evaluate("/home/oscar/file.txt"))
// console.log(JSON.stringify(list));
/* const file = fs.readFileSync("/home/oscar/filters.txt", "utf8");
//console.log(JSON.parse(file))
list.save("");
var a=JSON.parse(file);
var i:number;
for(i=0;i<a.length;i++){
    console.log(a[i].condition)
}
console.log(list.filters) */
