const express=require('express');
const mongoose=require('mongoose');
// const multer=require('multer');
const cors = require('cors');
const exp_status = require('express-status-monitor');
// const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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
// const uploadi = multer({
//     storage: multerS3({
//         s3: client,
//         bucket: process.env.BUCKET_NAME,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             cb(null, `uploads/kol/img/${Date.now().toString()}-${file.originalname}`);
//         }
//     })
// });

// storage config for PDF
// const uploadf = multer({
//     storage: multerS3({
//         s3: client,
//         bucket: process.env.BUCKET_NAME,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         metadata: (req, file, cb) => {
//             cb(null, { 
//                 fieldName: file.originalname,
//                 // contentType: 'application/pdf',
//                 // contentDisposition: 'inline'
//             });
//         },
//         key: (req, file, cb) => {
//             cb(null, `uploads/kol/pdf/${Date.now().toString()}-${file.originalname}`);
//         }
//     })
// });


// const bloodSchema = new mongoose.Schema({
//     rbc: {
//         type: Number,
//         required: true
//     },
//     wbc: {
//         type: Number,
//         required: true
//     },
//     heamoglobin: {
//         type: Number,
//         required: true
//     },
//     platelets: {
//         type: Number,
//         required: true
//     },
//     serum_creatinine: {
//         type: Number,
//         required: true
//     },
//     urea: {
//         type: Number,
//         required: true
//     },
// });

const HRSchema = new mongoose.Schema({
    systole: {
        type: Number,
        required: true
    },
    diastole: {
        type: Number,
        required: true
    },
    parabolic: {
        type: Number,
        required: true
    },
});

const sessionSchema = new mongoose.Schema({
    age: {
        type: Number, 
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
    severity: {
        type: String,
        required: true
    },
    // last_checked: {
    //     type: Date,
    //     required: true
    // },

    rbc: {
        type: Number,
        required: true
    },
    wbc: {
        type: Number,
        required: true
    },
    heamoglobin: {
        type: Number,
        required: true
    },
    platelets: {
        type: Number,
        required: true
    },
    serum_creatinine: {
        type: Number,
        required: true
    },
    urea: {
        type: Number,
        required: true
    },

    systole: {
        type: Number,
        required: true
    },
    diastole: {
        type: Number,
        required: true
    },
    parabolic: {
        type: Number,
        required: true
    },

    bone_marrow: {
        type: Number,
        required: true
    },
    immune_system: {
        type: Number,
        required: true
    },
    spleen: {
        type: Number,
        required: true
    },
    lymph_node: {
        type: Number,
        required: true
    },

    report: {
        type: String,
        required: true
    },
    disease: {
        type: [String],
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

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        immutable: true,
        required: true
    },
    gender: {
        type: String,
        immutable: true,
        required: true
    },
    branch: {
        type: String,
        immutable: true,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        // immutable: true,
        required: true
    },
    cause: {
        type: String,
        immutable: true,
        required: true
    },
    sessionDet: {
        type: [sessionSchema],
        required: true
    },
}, {timestamps: true});

const PModel = mongoose.model('patient', PatientSchema);


app.get('/',(req,res)=>{
    console.log('/ URL hitted');
    res.send({message: "Backend works"});
});


// upload img
// app.post('/uploadi', uploadi.single('img'), async (req, res) => {

//     try {
//         if (!req.file) {
//             console.log('img is missing');
//             return res.status(400).json({ error: 'Image upload failed' });
//         }

//         const fileUrl = `${process.env.CLOUDFRONT_DOMAIN_NAME}/${req.file.key}`;

//         console.log('img is done')
//         res.status(200).json({
//             message: 'Image uploaded successfully',
//             fileUrl, // Pre-signed URL for the uploaded image
//         });
//         } catch (error) {
//             console.error('Error generating pre-signed URL: ', error);
//             res.status(500).json({ error: 'Error generating pre-signed URL' });
//         }
// });

// upload pdf
// app.post('/uploadf', uploadf.single('pdf'), async (req, res) => {
//     try {
//         if (!req.file) {
//             console.log('pdf is missing');
//             return res.status(400).json({ error: 'Pdf upload failed' });
//         }

//         const fileUrl = `${process.env.CLOUDFRONT_DOMAIN_NAME}/${req.file.key}`;
//         console.log('pdf is done');
//         res.status(200).json({
//             message: 'Pdf uploaded successfully',
//             fileUrl, // Pre-signed URL for the uploaded image
//         });
//         } catch (error) {
//             console.error('Error generating pre-signed URL: ', error);
//             res.status(500).json({ error: 'Error generating pre-signed URL' });
//         }
// });


// Create masked URL (GET)
app.get('/encode', async (req, res) => {
    let folder;
    const fileName = req.query.fileName;
    const fileType = req.query.fileType;

    console.log('fileName',fileName);
    console.log('fileType',fileType);

    if ((fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png' ) && req.query?.fileD)
        folder = 'dis';
    else if ((fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png' ))
        folder = 'img';
    else
        folder = 'pdf';

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploads/kol/${folder}/${Date.now().toString()}-${fileName}`,
        // Expires: 3600, // URL expiration time in seconds
        ContentType: fileType,
    };

    try {
        console.log('key', params.Key);
        const command = new PutObjectCommand(params);
        // console.log('command', command);
        const presignedUrl = await getSignedUrl(client, command);
        console.log('presignedUrl', presignedUrl);

        res.status(200).json({
            url: presignedUrl,
            path: params.Key
        });
    } catch (error) {
        console.log('catch error',error);
        res.status(500).json({ error: 'Error generating pre-signed URL' });
    }
});


// Create patients (POST)
app.post('/patients', async (req, res) => {
    try {
        const {
            name, address, gender, branch, image, cause,
            sessionDet
        } = req.body;

        // console.log('req.body', req.body);
        // console.log('sessionDet.disease', sessionDet.disease);  


        // Create a new patient instance using the PModel, not Patient
        const newPatient = new PModel({
                name: name,
                gender: gender,
                address: address,
                branch: branch,
                image: image,
                cause: cause,
                sessionDet: [{
                    age: sessionDet.age,
                    height: sessionDet.height,
                    weight: sessionDet.weight,
                    severity: sessionDet.severity,
                    systole: sessionDet.systole,
                    diastole: sessionDet.diastole,
                    parabolic: sessionDet.parabolic,
                    rbc: sessionDet.rbc,
                    wbc: sessionDet.wbc,
                    heamoglobin: sessionDet.heamoglobin,
                    platelets: sessionDet.platelets,
                    serum_creatinine: sessionDet.serum_creatinine,
                    urea: sessionDet.urea,
                    bone_marrow: sessionDet.bone_marrow,
                    immune_system: sessionDet.immune_system,
                    spleen: sessionDet.spleen,
                    lymph_node: sessionDet.lymph_node,
                    report: sessionDet.report,
                    disease: sessionDet.disease,
                    coenzymes: sessionDet.coenzymes,
                    boosters: sessionDet.boosters,
                    vitamins: sessionDet.vitamins,
                    trace: sessionDet.trace
                }]
        });

        await newPatient.save();
        console.log('--------patient added');
        res.status(201).json({message: 'success', newPatient});
    } catch (error) {
        console.error('error in catch',error);
        if (error) {
            res.status(400).json({ message: 'error', err: error.message });
        } else{
            res.send({ err: 'error in catch' });
            res.status(500).json({ message: "error in catch--------" });
        }
    }
});


// Get all patients (GET) -----> new
app.get('/all', async (req, res) => {
    try {
        const patients = await PModel.find({});

        // console.log(patients);

        let patientDet = [];
        patients.map((each) => {
            patientDet.push({
                _id: each._id,
                name: each.name,
                age: each.sessionDet[each.sessionDet.length-1].age,
                cause: each.cause,
                image: each.image,
                last_checked: each.updatedAt
            })
        })
        // console.log(patientDet);

        res.status(200).json({
            message: "success",
            totalPatients: patients.length,
            patientsData: patientDet
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});


// Get all patients (GET) -----> old
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
        res.status(500).json({ message: 'Error fetching patient', det: error });
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

app.put('/patients/:id', async (req, res) => {
    try {
        const {
            age, height, weight, severity, systole, diastole, parabolic, 
            rbc, wbc, platelets, serum_creatinine, urea, heamoglobin,
            bone_marrow, immune_system, spleen, lymph_node,
            report, disease, 
            coenzymes, boosters, vitamins, trace
        } = req.body;

        const updateData = {};

        if (age !== undefined) updateData.age = age;
        if (height !== undefined) updateData.height = height;
        if (weight !== undefined) updateData.weight = weight;
        if (severity) updateData.severity = severity;
        if (systole) updateData.systole = systole;
        if (diastole) updateData.diastole = diastole;
        if (parabolic) updateData.parabolic = parabolic;
        if (rbc) updateData.rbc = rbc;
        if (wbc) updateData.wbc = wbc;
        if (platelets) updateData.platelets = platelets;
        if (serum_creatinine) updateData.serum_creatinine = serum_creatinine;
        if (urea) updateData.urea = urea;
        if (heamoglobin) updateData.heamoglobin = heamoglobin;
        if (bone_marrow) updateData.bone_marrow = bone_marrow;
        if (immune_system) updateData.immune_system = immune_system;
        if (spleen) updateData.spleen = spleen;
        if (lymph_node) updateData.lymph_node = lymph_node;
        if (report) updateData.report = report;
        if (disease && disease.length > 0) updateData.disease = disease;
        if (coenzymes && coenzymes.length > 0) updateData.coenzymes = coenzymes;
        if (boosters && boosters.length > 0) updateData.boosters = boosters;
        if (vitamins && vitamins.length > 0) updateData.vitamins = vitamins;
        if (trace && trace.length > 0) updateData.trace = trace;

        const updatedPatient = await PModel.findByIdAndUpdate(
            req.params.id,
            { $push: { sessionDet: updateData } },
            { new: true } // Return the updated document
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({message: 'record updated', updatedPatient});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating patient' });
    }
});


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


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('MongoDB connected...');
        // console.log('ps',PatientSchema);
    }).catch(err => console.error('MongoDB connection error:', err));