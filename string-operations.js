function StringOperations()
{
		var DIM_ID = "agg";
		var DIM_SEPERATOR = "_";	
}

StringOperations.buildID = function(aggregate)
{
	var clearedAggregate = aggregate.replace(/[ \-\+\'\(\)]/g, "_");
			
	return StringOperations.DIM_ID + StringOperations.DIM_SEPERATOR + clearedAggregate;
};
		
StringOperations.capitaliseFirstLetter = function(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
};