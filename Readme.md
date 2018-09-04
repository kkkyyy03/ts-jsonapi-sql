# JSONAPI for SQL

TypeScript 3 is required.

```typescript
import { Model } from 'ts-jsonapi-sql'

interface Fields {
  name: string
}

class Company extends Model<Fields> {
  generateID (): string {
    return 'some-id'
  }
}

let withmetoday = new Company({
  name: 'WithmeToday'
})

let anotherCompany = new Company({
  name: 'AnotherCorp'
})

// WithmeToday
console.log(withmetoday.name)

// INSERT INTO `table` (`id`, `name`) VALUES ('some-id', 'WithmeToday')
console.log(withmetoday.insertQuery())

// SELECT `id`, `name` FROM `table` WHERE `name` = 'WithmeToday'
console.log(withmetoday.selectQuery())

// DELETE FROM `table` WHERE `name` = 'WithmeToday'
console.log(withmetoday.deleteQuery())

// UPDATE `table` SET `name` = 'With me Today' WHERE `name` = 'WithmeToday'
// Caution: model is not updated.
console.log(withmetoday.updateQuery((fields: Fields) => { fields.name = 'With me Today' }))
withmetoday.update()

// SELECT
//   `self`.`id` AS `id`,
//   `self`.`name` AS `name`,
//   `anotherCompany`.`id` AS `b_id`,
//   `anotherCompany`.`name` AS `anotherCompany_name`
// FROM
//   `table` AS `self`
// LEFT JOIN
//   `table` AS `anotherCompany`
// ON
//   `anotherCompany`.`id` = 'some-id'
// FROM
//   `self`.`id` = 'some-id'
console.log(withmetoday.with({ anotherCompany }).selectQuery())
```