const express=require('express');
const mongoose=require('mongoose');
const multer=require('multer');
const cors = require('cors');
const exp_status = require('express-status-monitor');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config();

const port= process.env.PORT;


const app=express();

// Pre-defined Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Enable CORS for all routes
app.use(exp_status());



// S3 client config
const client = new S3Client({ 
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
    region: process.env.REGION
});


// const storage = m.memoryStorage();  // Store files in memory as buffers
// const upload = m({ storage: storage });

// storage config for Image
const uploadi = multer({
    storage: multerS3({
        s3: client,
        bucket: process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `uploads/kol/img/${Date.now().toString()}-${file.originalname}`);
        }
    })
});

// storage config for PDF
const uploadf = multer({
    storage: multerS3({
        s3: client,
        bucket: process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { 
                fieldName: file.originalname,
                // contentType: 'application/pdf',
                // contentDisposition: 'inline'
            });
        },
        key: (req, file, cb) => {
            cb(null, `uploads/kol/pdf/${Date.now().toString()}-${file.originalname}`);
        }
    })
});


const URI = process.env.MONGODB_URL;


const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number, 
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    cause: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    last_checked: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    report: {
        // type: Buffer,
        type: String,
        required: true
    },
    image: {
        // type: Buffer,
        type: String,
        required: true
    },
    coenzymes: {
        type: [String],
        required: true
    },
    boosters: {
        type: [String],
        required: true
    },
    vitamins: {
        type: [String],
        required: true
    },
    trace: {
        type: [String],
        required: true
    },
}, {timestamps: true});

const PModel = mongoose.model('patient', PatientSchema);


app.get('/',(req,res)=>{
    console.log('/ URL hitted');
    res.send({message: "Backend works"});
});




app.post('/uploadi', uploadi.single('img'), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image upload failed' });
        }

        const fileUrl = `${process.env.CLOUDFRONT_DOMAIN_NAME}/${req.file.key}`;

        res.status(200).json({
            message: 'Image uploaded successfully',
            fileUrl, // Pre-signed URL for the uploaded image
        });
        } catch (error) {
            console.error('Error generating pre-signed URL: ', error);
            res.status(500).json({ error: 'Error generating pre-signed URL' });
        }
});

// upload pdf
app.post('/uploadf', uploadf.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Pdf upload failed' });
        }

        const fileUrl = `${process.env.CLOUDFRONT_DOMAIN_NAME}/${req.file.key}`;

        res.status(200).json({
            message: 'Pdf uploaded successfully',
            fileUrl, // Pre-signed URL for the uploaded image
        });
        } catch (error) {
            console.error('Error generating pre-signed URL: ', error);
            res.status(500).json({ error: 'Error generating pre-signed URL' });
        }
});


// Create patients (POST)
/*
app.post('/patients', upload.fields([{ name: 'report' }, { name: 'image' }]), async (req, res) => {
    try {
        const {
            name, age, gender, height, weight, cause, branch, last_checked,
            address, coenzymes, boosters, vitamins, trace
        } = req.body;


        console.log('this is image',req.files.image);
        console.log('this is report',req.files.report);
        

        if (!req.files || !req.files.report || !req.files.image) {
            res.send({ err: 'image and pdf not attached' });
            return res.status(400).json({ err: 'image and pdf not attached--------' });
        }

        // Create a new patient instance using the PModel, not Patient
        const newPatient = new PModel({
            name: name,
            age: age,
            gender: gender,
            height: height,
            weight: weight,
            cause: cause,
            branch: branch,
            last_checked: new Date(last_checked),
            address: address,
            report: req.files.report[0].buffer,
            image: req.files.image[0].buffer,
            coenzymes: coenzymes ? JSON.parse(coenzymes) : [],
            boosters: boosters ? JSON.parse(boosters) : [],
            vitamins: vitamins ? JSON.parse(vitamins) : [],
            trace: trace ? JSON.parse(trace) : []
        });

        await newPatient.save();
        console.log('--------patient added');
        res.status(201).json({message: 'success', newPatient});
    } catch (error) {
        console.error('error in catch',error);
        if (error) {
            res.send({ err: error.message });
        } else{
            res.send({ err: 'error in catch' });
            res.status(500).json({ message: "error in catch--------" });
        }
    }
}); */


app.post('/patients', async (req, res) => {
    try {
        const {
            name, age, gender, height, weight, cause, branch, last_checked,
            address, coenzymes, boosters, vitamins, trace, image, report
        } = req.body;


        // console.log('this is image',req.files.image);
        // console.log('this is report',req.files.report);
        

        // if (!req.files || !req.files.report || !req.files.image) {
        //     res.send({ err: 'image and pdf not attached' });
        //     return res.status(400).json({ err: 'image and pdf not attached--------' });
        // }

        // Create a new patient instance using the PModel, not Patient
        const newPatient = new PModel(
            // req.body
            {
            name: name,
            age: age,
            gender: gender,
            height: height,
            weight: weight,
            cause: cause,
            branch: branch,
            last_checked: new Date(last_checked),
            address: address,
            // report: req.files.report[0].buffer,
            // image: req.files.image[0].buffer,
            report: report,
            image: image,
            coenzymes: coenzymes,
            boosters: boosters,
            vitamins: vitamins,
            trace: trace
        }
    );

        await newPatient.save();
        console.log('--------patient added');
        res.status(201).json({message: 'success', newPatient});
    } catch (error) {
        console.error('error in catch',error);
        if (error) {
            res.send({ message: 'error', err: error.message });
        } else{
            res.send({ err: 'error in catch' });
            res.status(500).json({ message: "error in catch--------" });
        }
    }
});


app.get('/all', async (req, res) => {
    try {
        const patients = await PModel.find({});
        res.status(200).json({
            message: "success",
            totalPatients: patients.length,
            patientsData: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});


// Get all patients (GET)
app.get('/patients', async (req, res) => {
    try {
        const includeBinary = req.query.includeBinary === 'true';
        const projection = includeBinary ? {} : '-report -image';

        // Get pagination parameters from query with default values
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch patients with pagination
        const patients = await PModel.find({}, projection).skip(skip).limit(limit);
        const totalPatients = await PModel.countDocuments();

        console.log('fetched '+patients.length+' patients');
        // Return paginated list of patients
        res.status(200).json({
            message: "success",
            count: patients.length,
            totalPatients,
            patientsData: patients
        });
    } catch (error) {
        // Log the error in case something goes wrong
        console.error('Error fetching patients:', error);
        console.log('-----------')
        
        // Return a 500 error with a detailed message
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});


// Get a patient by ID (GET)
app.get('/patients/:id', async (req, res) => {
    try {
        const patient = await PModel.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching patient' });
    }
});


// Update a patient (PUT)
// app.put('/patients/:id', upload.fields([{ name: 'report', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
//     try {
//         const {
//             name, age, gender, height, weight, cause, branch, last_checked,
//             address, coenzymes, boosters, vitamins, trace
//         } = req.body;

//         const updateData = {
//             name,
//             age,
//             gender,
//             height,
//             weight,
//             cause,
//             branch,
//             last_checked: new Date(last_checked),
//             address,
//             coenzymes: coenzymes ? coenzymes.split(',') : [],
//             boosters: boosters ? boosters.split(',') : [],
//             vitamins: vitamins ? vitamins.split(',') : [],
//             trace: trace ? trace.split(',') : []
//         };

//         if (req.files && req.files.report) {
//             updateData.report = req.files.report[0].buffer;
//         }

//         if (req.files && req.files.image) {
//             updateData.image = req.files.image[0].buffer;
//         }

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: 'Patient not found' });
//         }

//         res.status(200).json(updatedPatient);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error updating patient' });
//     }
// });


// Delete a patient (DELETE)
app.delete('/patients/:id', async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting patient' });
    }
});


app.listen(port, ()=>{
    console.log('Server is Running on PORT',port);
});


mongoose.connect(URI)
    .then(() => {
        console.log('MongoDB connected...');
        // console.log('ps',PatientSchema);
    }).catch(err => console.error('MongoDB connection error:', err));