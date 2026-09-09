const fs = require('fs');

function fixAppContext() {
  let file = 'src/context/AppContext.tsx';
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/flexibility:\s*'[^']+',/g, 
`timeFlexibility: 'Moderate',
    effortFlexibility: 'Moderate',
    workloadType: 'Assignment',
    timingType: 'Deadline',
    importance: 'Medium',
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      source: 'workload-default'
    },`);
  fs.writeFileSync(file, content);
}

function fixAdd() {
  let addFile = 'src/components/Workload/AddWorkloadModal.tsx';
  let addContent = fs.readFileSync(addFile, 'utf-8');
  addContent = addContent.replace(/flexibility:\s*flexibility,/, 
`timeFlexibility: 'Moderate',
      effortFlexibility: 'Moderate',
      workloadType: 'Assignment',
      timingType: 'Deadline',
      importance: 'Medium',
      schedulingCharacteristics: {
        splittable: true,
        spacingPreferred: true,
        source: 'workload-default'
      },`);
  // also remove the flexibility state and select
  addContent = addContent.replace(/const \[flexibility, setFlexibility\] = useState<FlexibilityLevel>\('Moderate'\);/, '');
  fs.writeFileSync(addFile, addContent);
}

function fixDetail() {
  let detailFile = 'src/components/Workload/WorkloadDetailModal.tsx';
  let detailContent = fs.readFileSync(detailFile, 'utf-8');
  detailContent = detailContent.replace(/flexibility:\s*e\.target\.value\s*as\s*FlexibilityLevel,/, '');
  fs.writeFileSync(detailFile, detailContent);
}

function fixBalance() {
  let balanceFile = 'src/views/BalanceView.tsx';
  let balanceContent = fs.readFileSync(balanceFile, 'utf-8');
  balanceContent = balanceContent.replace(/<span className=\"px-2 py-0\.5 rounded text-xs[^>]+>\{w\.flexibility\}<\/span>/, '');
  fs.writeFileSync(balanceFile, balanceContent);
}

try { fixAppContext(); } catch(e) { console.error(e) }
try { fixAdd(); } catch(e) { console.error(e) }
try { fixDetail(); } catch(e) { console.error(e) }
try { fixBalance(); } catch(e) { console.error(e) }
console.log('Fixed');
