import { menuModel } from "./menuModel.js";
export const getAllProducts = async (req, res) => {
    try {
        const menu = await menuModel.find();
        res.status(200).send({ message: 'product fitch succesfuly', data: menu })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Eror ! can't get all product ", data: err })
    }
}
export const postProduct = async (req, res) => {
    try {
        const data = req.body;
        const menu = await menuModel.find();
        const existInMenu = menu.find(
            (p) => p.title === data.title
        );
        if (existInMenu) {
            return res.status(404).send({ message: 'Item already exist in menu' })
        }
        const newProduct = await menuModel.create(data);
        newProduct.save();
        res.status(200).send({ message: 'product posted succesfuly', data: newProduct })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Eror ! can't creat product ", data: err })
    }
}
export const getSelectedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await menuModel.findById(id);
        if (!product) {
            return res.status(404).send({ message: 'product not found' })
        }
        res.status(200).send({ message: 'product fitch succesfuly', data: product })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Eror ! can't get  product ", data: err })
    }
}
export const updateSelectedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateProduct = await menuModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updateProduct) {
            return res.status(404).send({ message: 'product not found' })
        }
        res.status(200).send({ message: 'product updated succesfuly', data: updateProduct })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Eror ! can't updat the product ", data: err })
    }
}
export const deleteSelectedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletProduct = await menuModel.findByIdAndDelete(id);
        if (!deletProduct) {
            return res.status(404).send({ message: 'product not found' })
        }
        res.status(200).send({ message: 'product deletet succesfuly', data: deletProduct })
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Eror ! can't delete the product ", data: err })
    }
}