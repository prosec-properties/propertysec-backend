export default class UsersController {
    async me({ auth, response }) {
        try {
            await auth.check();
            const user = auth.user;
            response.ok(user);
        }
        catch (error) {
            console.log(error.message);
        }
    }
}
//# sourceMappingURL=users_controller.js.map