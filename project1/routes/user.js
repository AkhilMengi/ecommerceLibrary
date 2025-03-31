const express = require('express')
const router = express.Router()
const { handleGetAllUser, handleGetUserById, handleUpdateUserById, handleDeleteUserById, handleCreateNewUser } = require('../controller/user')

router
    .get('/', handleGetAllUser)
    .post('/', handleCreateNewUser)


router
    .route("/:id")
    .get(handleGetUserById)
    .patch(handleUpdateUserById)
    .delete(handleDeleteUserById


        // const id = Number(req.params.id);
        // const user = users.findIndex((user) => user.id === id)
        // if (user !== -1) {
        // users.splice(user, 1); // Remove the user from the array
        // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        //     return res.json({
        //         status: 'success',
        //         id: users.length
        //     })
        // })

        // } else {
        //     return res.status(404).json({ message: "User not found" });
        // }

    )


module.exports = router;

