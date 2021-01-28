const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const Booktype = new GraphQLObjectType({
  name: "book",
  description: "this represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {type: AuthorType, resolve: (book) => {
      return authors.find(author =>  author.id === book.authorId)
    }}
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "this represents an author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: { 
      type: new GraphQLList(Booktype), 
      resolve: (author) => books.filter(book => book.authorId === author.id)}
  }),
});

const rootQuery = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    book: {
      type: Booktype,
      description: 'a single book',
      args: {
        id: { type: GraphQLInt}
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(Booktype),
      description: "list of books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "list authors",
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: "single author",
      args: {
        id: {type: GraphQLInt}},
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    },
  }),
  description: "Root Query",
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'root mutation',
  fields: () => ({
    addBook: {
      type: Booktype,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString)},
        authorId: { type: GraphQLNonNull(GraphQLInt)},
      },
      resolve: (parent, args) => {
        const book = { id: books.length +1, name: args.name, authorId: args.authorId}
        books.push(book)
        return book
      }
    },
    addAuthor: {  
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString)},
      },
      resolve: (parent, args) => {
        const author = { id: authors.length +1, name: args.name, }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: rootQuery,
  mutation: RootMutationType
});

app.use("/graphql", graphqlHTTP({ schema: schema, graphiql: true }));
app.listen(5000, () => {
  console.log("listening to all the things!");
});
