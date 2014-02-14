Ext.cmd.api.adapter = {
    
    testResults: [],
    isRunning: false,
    resultBufferSize: 100,
    
    setCurrentScript: function(name) {
        // no-op, managed by Ext.Boot.currentFile
    },

    getCurrentScript: function() {
        return Ext.cmd.api.getCurrentScript(Ext.Boot.currentFile);
    },

    getSpecStructure: function(spec) {
        var structure = {
            hash: '' + spec.id,
            fileName: spec.fileName,
            description: spec.description
        };
        return structure;
    },
    
    getSuiteStructure: function(suite) {
        var structure = {
            hash: '' + suite.id,
            fileName: suite.fileName,
            suites: [],
            specs: [],
            description: suite.description
        },
        specs = suite.specs_,
        spLen = specs.length, spec, sp,
        suites = suite.suites_,
        suLen = suites.length, suite, su;
        
        for(su = 0; su < suLen; su++) {
            suite = suites[su];
            structure.suites.push(this.getSuiteStructure(suite));
        }
        
        for(sp = 0; sp < spLen; sp++) {
            spec = specs[sp];
            structure.specs.push(this.getSpecStructure(spec));
        }
        
        return structure;
    },
    
    reportTestStructure: function() {
        var runner = jasmine.getEnv().currentRunner_,
            suites = runner.topLevelSuites(),
            slen = suites.length, suite, s,
            structure = [];
    
        for(s = 0; s < slen; s++) {
            suite = suites[s];
            structure.push(this.getSuiteStructure(suite));
        }
        Ext.cmd.api.addTestSuites(structure);
    },

    executeTests: function() {
        this.isRunning = true;
        jasmine.setOptions(Ext.cmd.api.jsonOptions);
        jasmine.initDebug();
        jasmine.getEnv().addReporter(new SenchaTestRunner.Reporter());
        jasmine.getEnv().execute();
    },

    flushTestResults: function() {
        if(this.testResults.length > 0) {
            var results = this.testResults;
            this.testResults = [];
            Ext.cmd.api.reportTestResults(results);
        }
    },
    
    onTestResult: function(result) {
        this.testResults.push(result);
        if(this.testResults.length >= this.resultBufferSize) {
            this.flushTestResults();
        }
    },
    
    onTestsDone: function(success) {
        var me = this;
        me.isRunning = false;
        if(success === undefined) {
            me.success = true;
        } else {
            me.success = success;
        }
        me.flushTestResults();
        Ext.cmd.api.stopWorkItem(me.success);
    }
};