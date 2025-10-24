import * as pg from 'pg'

export const pool = new pg.Pool({
  database: 'nas_todos'
})

export default async function Init() {
  await pool.query(
    `create table if not exists categories (
      id serial primary key,
      name text unique
    );`
  )

  await pool.query(
    `create table if not exists todos (
      id serial primary key,
      todo text,
      done boolean,
      category_id int references categories (id),
      category_name text references categories(name)
    );`
  )
}

export async function exec(query: string, params: any[] | undefined) {
  const { rows } = await pool.query(query, params)
  return rows
}

export async function getAllTodos() {
  const { rows } = await pool.query('select * from todos')
  return rows
}

export async function getFilteredTodos(catId: number) {
  const { rows } = await pool.query('select * from todos where category_id = $1;', [catId])
  return rows
}

export async function getAllCategories() {
  const { rows } = await pool.query('select * from categories')
  return rows
}

export async function postTodos(data: any) {
  const { rows } = await pool.query('insert into todos (todo, done, category_id) values ($1, $2, $3) returning id, todo, done, category_id;', [data.text, data.done, data.category_id])
  return rows
}

export async function postCategories(data: any) {
  const { rows } = await pool.query('insert into categories (name) values ($1) on conflict (name) do update set name = excluded.name returning id, name;', [data.category_name])
  return rows
}

export async function deleteTodo(index: number) {
  await pool.query('delete from todos where id = $1;', [index])
}

export async function deleteCategories() {
  await pool.query("DELETE FROM categories where NOT EXISTS (SELECT * from todos where todos.category_id = categories.id);")
}

export async function updateTodos(data: any, index: number) {
  const { rows } = await pool.query('update todos set todo = $1, done = $2, category_id = $3 where id = $4 returning id, todo, done, category_id;', [data.text, data.done, data.category_id, index])
  return rows
}
