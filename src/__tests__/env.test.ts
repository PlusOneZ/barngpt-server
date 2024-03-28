import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

test('ENV variables load', () => {
    expect(process.env.CURRENT_MODE).toBe('DEV');
})

test('Mongo URI ENV exists', () => {
    expect(process.env.MONGO_URI).toBeDefined()
})
