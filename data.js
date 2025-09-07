const data = {
	"taskDefinitions" : [
		{
			"name":"multiFileInput_S",//Single end input
			"text":"Single End",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"textarea",
					"text":"File names",
					"value":""
				}
			],
			"outputs": [
				{
					"type":"output",
					"value":"RAW_FASTA",
					"array":true
				}
			]
		},
		
		{
			"name":"multiFileInput_P",//Paired end input
			"text":"Paired End",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"textarea",
					"text":"File names (in pairs)",
					"value":""
				}
			],
			"outputs": [
				{
					"type":"output",
					"value":"RAW_FASTA_FORWARD",
					"array":true
				},
				{
					"type":"output",
					"value":"RAW_FASTA_REVERSE",
					"array":true
				}
			]
		},
		
		{
			"name":"FastQC_S",//Single end fastqc
			"text":"FastQC",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"RAW_FASTA"
				}
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"RAW_FASTA"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT'
					],
					"outputs": [
						'String OUTPUT = INPUT'
					],
					"command": [
						'fastqc ${INPUT}'
					]
				}
			}
		},
		
		{
			"name":"Trimmomatic_S",//Single trimmomatic
			"text":"Trimmomatic",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"RAW_FASTA"
				},
				{
					"name":"ILLUMINACLIP",
					"type":"selection",
					"value":"TruSeq3-SE:2:30:10",
					"text":"Illumina Clip",
					"options": [
						{"value":"TruSeq3-SE:2:30:10","text":"TruSeq3-SE:2:30:10"}
					]
				},
				{
					"name":"MINLEN",
					"type":"number",
					"value":"20",
					"text":"Minlen",
					"min":"16"
				},
				{
					"name":"SLIDINGWINDOW",
					"type":"number",
					"value":"4",
					"text":"Sliding Window",
					"min":"0",
					"max":"16"
				}
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"RAW_FASTA"
				},
				{
					"name":"UNPAIREDOUTPUT",
					"type":"output",
					"value":"RAW_FASTA_UNPAIRED"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String SUMMARY = "summary.txt"',
						'String INPUT',
						'String ILLUMINACLIP',
						'String SLIDINGWINDOW',
						'String MINLEN',
						'String OUT = sub(INPUT, "\\.fastq.gz$", "\\_trimmed.fastq.gz")',
						'String UNPAIREDOUT = sub(INPUT, "\\.fastq.gz$", "\\_trimmed_unpaired.fastq.gz")'
					],
					"outputs": [
						'String OUTPUT = OUT',
						'String UNPAIREDOUTPUT = UNPAIREDOUT'
					],
					"command": [
						'trimmomatic SE -phred33 -summary ${SUMMARY} ${INPUT} ${OUT} ${UNPAIREDOUT} ILLUMINACLIP:${ILLUMINACLIP} SLIDINGWINDOW:${SLIDINGWINDOW} MINLEN:${MINLEN} 2> trimlog.txt'
					]
				}
			}
		},
	]
}
