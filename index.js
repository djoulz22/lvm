var _ = require("underscore");
var exec = require("child_process").exec;
var Events = require("./lib/Events");

// Lvm #############################
var InternalEvents;

function Lvm(showlogs){	
	this.showlogs = (showlogs != null) ? showlogs : false;
	this.nodes = {
		vgs: {
			params: "--separator \":\" | sed -e 's/^[[:space:]]*//'"
		},
		pvs: {
			params: "-a --separator \":\" | sed -e 's/^[[:space:]]*//'"
		},
		lvs: {
			params: "--separator \":\" | sed -e 's/^[[:space:]]*//'"
		}
	};
	this.only_last_events = false;
	this.nodesCount = Object.keys(this.nodes).length;
	this.resultCount = 0;
	this.events = new Events();
		
	InternalEvents = new Events();
		
	var me = this;
	InternalEvents.OnBeforeOpen = function(cmd){
		if (me.showlogs) console.log("InternalEvents.OnBeforeOpen(" + cmd + ")");
		
		if (me.events.OnBeforeOpen) me.events.OnBeforeOpen(cmd);
	};
	InternalEvents.OnAfterOpen = function(cmd){		
		if(me.only_last_events) me.resultCount++;
		
		if (me.showlogs) console.log("InternalEvents.OnAfterOpen(" + JSON.stringify({"cmd": cmd, "resCount":me.resultCount, "nodesCnt":me.nodesCount}) + ")");
		
		if (!me.only_last_events || (me.resultCount == me.nodesCount)){
			if(me.only_last_events) me.only_last_events = false;
			if (me.events.OnAfterOpen) me.events.OnAfterOpen(cmd);	
		}
	};
	InternalEvents.OnBeforeParseData = function(datas){
		if (me.events.OnBeforeParseData) me.events.OnBeforeParseData(datas);
	};
	InternalEvents.OnAfterParseData = function(datas){
		if (me.events.OnAfterParseData) me.events.OnAfterParseData(datas);
	};
};

Lvm.prototype = {
	OpenAll: function(){
		this.resultCount = 0;
		this.only_last_events = true;
		for(var Command in this.nodes){
			this.Open(Command);
		}	
	},
	Open: function(cmd, params){		
		var me = this;
		
		if (cmd){
			
			if (me.showlogs) console.log("[" + cmd + "]");
			var cmdparams = (params) ? params : me.nodes[cmd].params;
			
			InternalEvents.OnBeforeOpen(cmd);
			
			if (me.showlogs) console.log("Calling Open(" + cmd + " " + cmdparams + ")");
			
			try{
				exec(cmd + " " + cmdparams, function (error, stdout, stderr) {
					if (me.showlogs) console.log("exec " + cmd);
			        	
					if (error){
						if (me.showlogs){
							console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
				        		console.log('exec error: ' + error);	
				        		console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");	
						}
			        		me.nodes[cmd].result = {"error": error, type: "error"};
			        	}
			        	else if(stderr){
						if (me.showlogs){
				        		console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
				        		console.log('stderr: ' + stderr);	
				        		console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
						}
			                        me.nodes[cmd].result = {"error": stderr, type: "stderr"};
			        	}
			        	else{
						me.nodes[cmd].result = me.parseData(stdout);
						
						if (me.showlogs) console.log(JSON.stringify(me.nodes[cmd].result,null,4));
			        	}
					
					InternalEvents.OnAfterOpen(cmd);
			        }); 
			} catch (err) {
				me.nodes[cmd].result = {"error": err, type: "exception"};
				InternalEvents.OnAfterOpen(cmd);
			}	
		}
		else{						
			this.OpenAll();
		}
	},
	parseData: function(plvm) {
		var me = this;		
		InternalEvents.OnBeforeParseData(plvm);
				
		var parsed_plvm = plvm.replace( /\n/g, "|" ).split("|");
		var headers = parsed_plvm[0].split(":");		
		parsed_plvm = parsed_plvm.slice(1,parsed_plvm.length-1);
			
		var retval = {};
		
		var restmp = "{";
		for (var headers_idx in headers){
			restmp += "\"" + headers[headers_idx] + "\": [],";
		}
		restmp = restmp.substr(0,restmp.length -1);
		
		restmp += "}";
		
		retval = JSON.parse(restmp);
		
		for (var idx in parsed_plvm){
			var tmp = parsed_plvm[idx].split(":");
			
			for (var headers_idx in headers){
				console.log(headers[headers_idx]);
				console.log(tmp[headers_idx]);
				retval[headers[headers_idx]].push((tmp[headers_idx] != "") ? tmp[headers_idx] : null);	
			}			
		}
						
		InternalEvents.OnAfterParseData(retval);
		
		return retval;
	}
}
// Lvm #############################

module.exports = Lvm;