const express=require('express');
const mongoose=require('mongoose');
const m=require('multer');
// const pdfkit=require('pdfkit');
// const fs=require('fs');
const cors = require('cors');
require('dotenv').config()


const app=express();
const port= process.env.PORT;
// const path = require('path');



const storage = m.memoryStorage();  // Store files in memory as buffers
const upload = m({ storage: storage });

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
        type: Buffer,
        required: true
    },
    image: {
        type: Buffer,
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



    // function reset(){
    //     let folder=__dirname+'/uploads/';

    //     fs.readdir(folder,(err,fls)=>{
    //         for(const file of fls){
    //             fs.unlinkSync(folder+file);
    //         }
    //     });
    // }

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors()); // Enable CORS for all routes
    // app.use(express.static(__dirname+'/'+'public'));
    // app.use('/pages', express.static(path.join(__dirname, 'pages')));
    // app.set('view engine','ejs');


app.get('/',(req,res)=>{
    res.send({message: "Backend works"});
    // reset();
    // res.sendFile(__dirname+'/'+'pages/form.html');
});
    // app.get('/details', (req, res) => {
    //     res.sendFile(__dirname+'/'+'pages/details.html');
    // });
    // app.get('/rep', (req, res) => {
    //     res.sendFile(__dirname+'/'+'pages/rep.html');
    // });

    // app.post('/convert',upload.array('files'),(req,res)=>{
    //     let filename='untitled.pdf';
    //     const doc=new pdfkit();
    //     doc.pipe(fs.createWriteStream(__dirname+'/pdf/'+filename));

    //     for(let i=0;i<req.files.length;i++){
    //         if(i>0){
    //             doc.addPage();
    //         }
    //         doc.image(req.files[i].path,{
    //             fit:[500,500],
    //             align:'center',
    //             valign:'center'
    //         });
    //     }
    //     doc.end();
    //     res.render('response',{filename:filename});
    //     console.log('file :', filename);
    // });

    // app.post('/download',(req,res)=>{
    //     res.download(__dirname+'/pdf/untitled.pdf');
    // });

    // app.post('/patients', upload.fields([{ name: 'report' }, { name: 'image' }]), async (req, res) => {
    
    
app.post('/patients', upload.fields([{ name: 'report' }, { name: 'image' }]), async (req, res) => {
    try {
        const {
            name, age, gender, height, weight, cause, branch, last_checked,
            address, coenzymes, boosters, vitamins, trace
        } = req.body;


        console.log('this is image',req.files.image);
        console.log('this is report',req.files.report);

        if (!req.files || !req.files.report || !req.files.image) {
            return res.status(400).json({ err: 'error occured', message: error.message });
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
        console.log('body',req.body);
        console.log('files',req.files);
        res.status(201).json({message: 'success', newPatient});
    } catch (error) {
        console.error('error in catch');
        res.status(500).json({ message: "error in catch" });
    }
});


// Get all patients (GET)
app.get('/patients', async (req, res) => {
    try {
        // Fetch all patients from the database, excluding 'report' and 'image' fields
        const patients = await PModel.find({}, '-report -image'); // Exclude the binary fields

        // Log the number of patients fetcheds
        console.log(`Fetched ${patients.length} patients`);

        // Return the list of patients
        res.status(200).json({message: "success", count: patients.length, patientsData: patients});
    } catch (error) {
        // Log the error in case something goes wrong
        console.error('Error fetching patients:', error);
        
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
app.put('/patients/:id', upload.fields([{ name: 'report', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        const {
            name, age, gender, height, weight, cause, branch, last_checked,
            address, coenzymes, boosters, vitamins, trace
        } = req.body;

        const updateData = {
            name,
            age,
            gender,
            height,
            weight,
            cause,
            branch,
            last_checked: new Date(last_checked),
            address,
            coenzymes: coenzymes ? coenzymes.split(',') : [],
            boosters: boosters ? boosters.split(',') : [],
            vitamins: vitamins ? vitamins.split(',') : [],
            trace: trace ? trace.split(',') : []
        };

        if (req.files && req.files.report) {
            updateData.report = req.files.report[0].buffer;
        }

        if (req.files && req.files.image) {
            updateData.image = req.files.image[0].buffer;
        }

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json(updatedPatient);
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

mongoose.connect(URI)
    .then(() => {
        console.log('MongoDB connected...');
        // console.log('ps',PatientSchema);
    }).catch(err => console.error('MongoDB connection error:', err));